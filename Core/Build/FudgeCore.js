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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VDb3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHMiLCIuLi9Tb3VyY2UvVHJhbnNmZXIvTXV0YWJsZS50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25GdW5jdGlvbi50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uS2V5LnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25TZXF1ZW5jZS50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpby50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0ZpbHRlci50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0xpc3RlbmVyLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvTG9jYWxpc2F0aW9uLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvU2Vzc2lvbkRhdGEudHMiLCIuLi9Tb3VyY2UvQXVkaW8vQXVkaW9TZXR0aW5ncy50cyIsIi4uL1NvdXJjZS9SZW5kZXIvUmVuZGVySW5qZWN0b3IudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck9wZXJhdG9yLnRzIiwiLi4vU291cmNlL0NvYXQvQ29hdC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50LnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRBbmltYXRvci50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50QXVkaW8udHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudEF1ZGlvTGlzdGVuZXIudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudENhbWVyYS50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50TGlnaHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudE1hdGVyaWFsLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRNZXNoLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRTY3JpcHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudFRyYW5zZm9ybS50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0ludGVyZmFjZXMudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUYXJnZXQudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdBbGVydC50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0NvbnNvbGUudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWcudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdEaWFsb2cudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUZXh0QXJlYS50cyIsIi4uL1NvdXJjZS9FbmdpbmUvQ29sb3IudHMiLCIuLi9Tb3VyY2UvRW5naW5lL01hdGVyaWFsLnRzIiwiLi4vU291cmNlL0VuZ2luZS9SZWN5Y2xlci50cyIsIi4uL1NvdXJjZS9FbmdpbmUvUmVzb3VyY2VNYW5hZ2VyLnRzIiwiLi4vU291cmNlL0xpZ2h0L0xpZ2h0LnRzIiwiLi4vU291cmNlL0VuZ2luZS9WaWV3cG9ydC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudEtleWJvYXJkLnRzIiwiLi4vU291cmNlL01hdGgvRnJhbWluZy50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDN4My50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDR4NC50cyIsIi4uL1NvdXJjZS9NYXRoL1JlY3RhbmdsZS50cyIsIi4uL1NvdXJjZS9NYXRoL1ZlY3RvcjIudHMiLCIuLi9Tb3VyY2UvTWF0aC9WZWN0b3IzLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaC50cyIsIi4uL1NvdXJjZS9NZXNoL01lc2hDdWJlLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaFB5cmFtaWQudHMiLCIuLi9Tb3VyY2UvTWVzaC9NZXNoUXVhZC50cyIsIi4uL1NvdXJjZS9Ob2RlL05vZGUudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2UudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2VJbnN0YW5jZS50cyIsIi4uL1NvdXJjZS9SYXkvUmF5LnRzIiwiLi4vU291cmNlL1JheS9SYXlIaXQudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck1hbmFnZXIudHMiLCIuLi9Tb3VyY2UvU2hhZGVyL1NoYWRlci50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyRmxhdC50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyTWF0Q2FwLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJSYXlDYXN0LnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJUZXh0dXJlLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJVbmlDb2xvci50cyIsIi4uL1NvdXJjZS9UZXh0dXJlL1RleHR1cmUudHMiLCIuLi9Tb3VyY2UvVGltZS9UaW1lLnRzIiwiLi4vU291cmNlL1RpbWUvTG9vcC50cyIsIi4uL1NvdXJjZS9UcmFuc2Zlci9GaWxlSW9Ccm93c2VyTG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLElBQVUsU0FBUyxDQXVMbEI7QUF2TEQsV0FBVSxTQUFTO0lBZ0JmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EyQkc7SUFDSCxNQUFzQixVQUFVO1FBSTVCOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFrQjtZQUM5QyxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVO2dCQUNsQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVTtvQkFDekMsT0FBTztZQUVmLElBQUksSUFBSSxHQUFXLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxJQUFJO2dCQUNMLEtBQUssSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtvQkFD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RUQ7Ozs7V0FJRztRQUNILFNBQVM7WUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsT0FBTzthQUNSO1lBRUQsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFFcEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBRTdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxL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LEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTSxNQUFNLEtBQUssS0FBSztZQUNuQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssS0FBSztZQUNuQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssR0FBRztZQUNqQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssS0FBSztZQUNuQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssSUFBSTtZQUNsQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTSxXQUFXLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVTtZQUM3RCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMs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QUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxNQUFNLEdBQWMsSUFBSSxTQUFTLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksR0FBRztnQkFDVixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2FBQ3BDLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU8sV0FBVyxDQUFDLGFBQXFCLEVBQUUsYUFBcUI7WUFDNUQsSUFBSSxNQUFNLEdBQWMsSUFBSSxTQUFTLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksR0FBRztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLGFBQWEsRUFBRSxhQUFhLEVBQUUsQ0FBQzthQUNsQyxDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUVPLE9BQU8sQ0FBQyxPQUFlLEVBQUUsT0FBZTtZQUM1QyxJQUFJLE1BQU0sR0FBYyxJQUFJLFNBQVMsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxHQUFHO2dCQUNWLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDYixDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ2IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1YsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFTyxRQUFRLENBQUMsZUFBdUI7WUFDcEMsSUFBSSxjQUFjLEdBQVcsR0FBRyxHQUFHLGVBQWUsQ0FBQztZQUNuRCxJQUFJLGNBQWMsR0FBVyxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDNUQsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzQyxJQUFJLEdBQUcsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzNDLElBQUksTUFBTSxHQUFjLElBQUksU0FBUyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLEdBQUc7Z0JBQ1YsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ1osR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNYLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNWLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBR0o7SUE5R1ksbUJBQVMsWUE4R3JCLENBQUE7QUFFTCxDQUFDLEVBdkhTLFNBQVMsS0FBVCxTQUFTLFFBdUhsQjtBQ3ZIRCxJQUFVLFNBQVMsQ0EwcUJsQjtBQTFxQkQsV0FBVSxTQUFTO0lBV2pCOzs7Ozs7Ozs7O09BVUc7SUFFSCxNQUFhLFNBQVUsU0FBUSxVQUFBLE9BQU87UUFLcEM7WUFDRSxLQUFLLEVBQUUsQ0FBQztZQUxGLFNBQUksR0FBaUIsSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQywwQkFBMEI7WUFDckUsWUFBTyxHQUFZLElBQUksQ0FBQyxDQUFDLDZIQUE2SDtZQUs1SixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDWixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1gsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFFRDs7O1dBR0c7UUFDSCxJQUFXLFdBQVc7WUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVztnQkFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxVQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxJQUFXLFdBQVcsQ0FBQyxZQUFxQjtZQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEMsK0JBQStCO1lBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztZQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsSUFBVyxRQUFRO1lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVE7Z0JBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNoRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztRQUNwQyxDQUFDO1FBQ0QsSUFBVyxRQUFRLENBQUMsU0FBa0I7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsSUFBVyxPQUFPO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87Z0JBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksVUFBQSxPQUFPLENBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDcEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNwRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3RELENBQUM7WUFDSixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUNuQyxDQUFDO1FBQ0QsSUFBVyxPQUFPLENBQUMsUUFBaUI7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRUQsaUJBQWlCO1FBQ2pCOztXQUVHO1FBQ0ksTUFBTSxLQUFLLFFBQVE7WUFDeEIsNkNBQTZDO1lBQzdDLE1BQU0sTUFBTSxHQUFjLFVBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDZCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1gsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQWEsRUFBRSxFQUFhO1lBQ3ZELElBQUksQ0FBQyxHQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDO1lBQzlCLElBQUksQ0FBQyxHQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDO1lBQzlCLDJDQUEyQztZQUMzQyxNQUFNLE1BQU0sR0FBYyxVQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2I7Z0JBQ0UsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7YUFDOUMsQ0FBQyxDQUFDO1lBQ0wsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBa0I7WUFDeEMsSUFBSSxDQUFDLEdBQWlCLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDbkMsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFFOUIsSUFBSSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDckQsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRXpDLElBQUksRUFBRSxHQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQ3JELENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUN0RCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztnQkFDdEQsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxHQUFXLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUVsRSx5Q0FBeUM7WUFDekMsTUFBTSxNQUFNLEdBQWMsVUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNkLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3JGLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3JGLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZGLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENB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dGVudCI6WyJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tYW55XHJcbiAgICBleHBvcnQgdHlwZSBHZW5lcmFsID0gYW55O1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgW3R5cGU6IHN0cmluZ106IEdlbmVyYWw7XHJcbiAgICB9XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGU7XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIE5hbWVzcGFjZVJlZ2lzdGVyIHtcclxuICAgICAgICBbbmFtZTogc3RyaW5nXTogT2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlcyB0aGUgZXh0ZXJuYWwgc2VyaWFsaXphdGlvbiBhbmQgZGVzZXJpYWxpemF0aW9uIG9mIFtbU2VyaWFsaXphYmxlXV0gb2JqZWN0cy4gVGhlIGludGVybmFsIHByb2Nlc3MgaXMgaGFuZGxlZCBieSB0aGUgb2JqZWN0cyB0aGVtc2VsdmVzLiAgXHJcbiAgICAgKiBBIFtbU2VyaWFsaXphdGlvbl1dIG9iamVjdCBjYW4gYmUgY3JlYXRlZCBmcm9tIGEgW1tTZXJpYWxpemFibGVdXSBvYmplY3QgYW5kIGEgSlNPTi1TdHJpbmcgbWF5IGJlIGNyZWF0ZWQgZnJvbSB0aGF0LiAgXHJcbiAgICAgKiBWaWNlIHZlcnNhLCBhIEpTT04tU3RyaW5nIGNhbiBiZSBwYXJzZWQgdG8gYSBbW1NlcmlhbGl6YXRpb25dXSB3aGljaCBjYW4gYmUgZGVzZXJpYWxpemVkIHRvIGEgW1tTZXJpYWxpemFibGVdXSBvYmplY3QuXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICBbU2VyaWFsaXphYmxlXSDihpIgKHNlcmlhbGl6ZSkg4oaSIFtTZXJpYWxpemF0aW9uXSDihpIgKHN0cmluZ2lmeSkgIFxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKGk1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1N0cmluZ11cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDihpNcclxuICAgICAqICBbU2VyaWFsaXphYmxlXSDihpAgKGRlc2VyaWFsaXplKSDihpAgW1NlcmlhbGl6YXRpb25dIOKGkCAocGFyc2UpXHJcbiAgICAgKiBgYGAgICAgICBcclxuICAgICAqIFdoaWxlIHRoZSBpbnRlcm5hbCBzZXJpYWxpemUvZGVzZXJpYWxpemUgbWV0aG9kcyBvZiB0aGUgb2JqZWN0cyBjYXJlIG9mIHRoZSBzZWxlY3Rpb24gb2YgaW5mb3JtYXRpb24gbmVlZGVkIHRvIHJlY3JlYXRlIHRoZSBvYmplY3QgYW5kIGl0cyBzdHJ1Y3R1cmUsICBcclxuICAgICAqIHRoZSBbW1NlcmlhbGl6ZXJdXSBrZWVwcyB0cmFjayBvZiB0aGUgbmFtZXNwYWNlcyBhbmQgY2xhc3NlcyBpbiBvcmRlciB0byByZWNyZWF0ZSBbW1NlcmlhbGl6YWJsZV1dIG9iamVjdHMuIFRoZSBnZW5lcmFsIHN0cnVjdHVyZSBvZiBhIFtbU2VyaWFsaXphdGlvbl1dIGlzIGFzIGZvbGxvd3MgIFxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiB7XHJcbiAgICAgKiAgICAgIG5hbWVzcGFjZU5hbWUuY2xhc3NOYW1lOiB7XHJcbiAgICAgKiAgICAgICAgICBwcm9wZXJ0eU5hbWU6IHByb3BlcnR5VmFsdWUsXHJcbiAgICAgKiAgICAgICAgICAuLi4sXHJcbiAgICAgKiAgICAgICAgICBwcm9wZXJ0eU5hbWVPZlJlZmVyZW5jZTogU2VyaWFsaXphdGlvbk9mVGhlUmVmZXJlbmNlZE9iamVjdCxcclxuICAgICAqICAgICAgICAgIC4uLixcclxuICAgICAqICAgICAgICAgIGNvbnN0cnVjdG9yTmFtZU9mU3VwZXJjbGFzczogU2VyaWFsaXphdGlvbk9mU3VwZXJDbGFzc1xyXG4gICAgICogICAgICB9XHJcbiAgICAgKiB9XHJcbiAgICAgKiBgYGBcclxuICAgICAqIFNpbmNlIHRoZSBpbnN0YW5jZSBvZiB0aGUgc3VwZXJjbGFzcyBpcyBjcmVhdGVkIGF1dG9tYXRpY2FsbHkgd2hlbiBhbiBvYmplY3QgaXMgY3JlYXRlZCwgXHJcbiAgICAgKiB0aGUgU2VyaWFsaXphdGlvbk9mU3VwZXJDbGFzcyBvbWl0cyB0aGUgdGhlIG5hbWVzcGFjZU5hbWUuY2xhc3NOYW1lIGtleSBhbmQgY29uc2lzdHMgb25seSBvZiBpdHMgdmFsdWUuIFxyXG4gICAgICogVGhlIGNvbnN0cnVjdG9yTmFtZU9mU3VwZXJjbGFzcyBpcyBnaXZlbiBpbnN0ZWFkIGFzIGEgcHJvcGVydHkgbmFtZSBpbiB0aGUgc2VyaWFsaXphdGlvbiBvZiB0aGUgc3ViY2xhc3MuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTZXJpYWxpemVyIHtcclxuICAgICAgICAvKiogSW4gb3JkZXIgZm9yIHRoZSBTZXJpYWxpemVyIHRvIGNyZWF0ZSBjbGFzcyBpbnN0YW5jZXMsIGl0IG5lZWRzIGFjY2VzcyB0byB0aGUgYXBwcm9wcmlhdGUgbmFtZXNwYWNlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIG5hbWVzcGFjZXM6IE5hbWVzcGFjZVJlZ2lzdGVyID0geyBcIsaSXCI6IEZ1ZGdlQ29yZSB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWdpc3RlcnMgYSBuYW1lc3BhY2UgdG8gdGhlIFtbU2VyaWFsaXplcl1dLCB0byBlbmFibGUgYXV0b21hdGljIGluc3RhbnRpYXRpb24gb2YgY2xhc3NlcyBkZWZpbmVkIHdpdGhpblxyXG4gICAgICAgICAqIEBwYXJhbSBfbmFtZXNwYWNlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXJOYW1lc3BhY2UoX25hbWVzcGFjZTogT2JqZWN0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgaW4gU2VyaWFsaXplci5uYW1lc3BhY2VzKVxyXG4gICAgICAgICAgICAgICAgaWYgKFNlcmlhbGl6ZXIubmFtZXNwYWNlc1tuYW1lXSA9PSBfbmFtZXNwYWNlKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmcgPSBTZXJpYWxpemVyLmZpbmROYW1lc3BhY2VJbihfbmFtZXNwYWNlLCB3aW5kb3cpO1xyXG4gICAgICAgICAgICBpZiAoIW5hbWUpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJlbnROYW1lIGluIFNlcmlhbGl6ZXIubmFtZXNwYWNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBTZXJpYWxpemVyLmZpbmROYW1lc3BhY2VJbihfbmFtZXNwYWNlLCBTZXJpYWxpemVyLm5hbWVzcGFjZXNbcGFyZW50TmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBwYXJlbnROYW1lICsgXCIuXCIgKyBuYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5hbWUpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOYW1lc3BhY2Ugbm90IGZvdW5kLiBNYXliZSBwYXJlbnQgbmFtZXNwYWNlIGhhc24ndCBiZWVuIHJlZ2lzdGVyZWQgYmVmb3JlP1wiKTtcclxuXHJcbiAgICAgICAgICAgIFNlcmlhbGl6ZXIubmFtZXNwYWNlc1tuYW1lXSA9IF9uYW1lc3BhY2U7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIGphdmFzY3JpcHQgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc2VyaWFsaXphYmxlIEZVREdFLW9iamVjdCBnaXZlbixcclxuICAgICAgICAgKiBpbmNsdWRpbmcgYXR0YWNoZWQgY29tcG9uZW50cywgY2hpbGRyZW4sIHN1cGVyY2xhc3Mtb2JqZWN0cyBhbGwgaW5mb3JtYXRpb24gbmVlZGVkIGZvciByZWNvbnN0cnVjdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSBfb2JqZWN0IEFuIG9iamVjdCB0byBzZXJpYWxpemUsIGltcGxlbWVudGluZyB0aGUgW1tTZXJpYWxpemFibGVdXSBpbnRlcmZhY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNlcmlhbGl6ZShfb2JqZWN0OiBTZXJpYWxpemFibGUpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7fTtcclxuICAgICAgICAgICAgLy8gVE9ETzogc2F2ZSB0aGUgbmFtZXNwYWNlIHdpdGggdGhlIGNvbnN0cnVjdG9ycyBuYW1lXHJcbiAgICAgICAgICAgIC8vIHNlcmlhbGl6YXRpb25bX29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lXSA9IF9vYmplY3Quc2VyaWFsaXplKCk7XHJcbiAgICAgICAgICAgIGxldCBwYXRoOiBzdHJpbmcgPSB0aGlzLmdldEZ1bGxQYXRoKF9vYmplY3QpO1xyXG4gICAgICAgICAgICBpZiAoIXBhdGgpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hbWVzcGFjZSBvZiBzZXJpYWxpemFibGUgb2JqZWN0IG9mIHR5cGUgJHtfb2JqZWN0LmNvbnN0cnVjdG9yLm5hbWV9IG5vdCBmb3VuZC4gTWF5YmUgdGhlIG5hbWVzcGFjZSBoYXNuJ3QgYmVlbiByZWdpc3RlcmVkIG9yIHRoZSBjbGFzcyBub3QgZXhwb3J0ZWQ/YCk7XHJcbiAgICAgICAgICAgIHNlcmlhbGl6YXRpb25bcGF0aF0gPSBfb2JqZWN0LnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICAgICAgLy8gcmV0dXJuIF9vYmplY3Quc2VyaWFsaXplKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgRlVER0Utb2JqZWN0IHJlY29uc3RydWN0ZWQgZnJvbSB0aGUgaW5mb3JtYXRpb24gaW4gdGhlIFtbU2VyaWFsaXphdGlvbl1dIGdpdmVuLFxyXG4gICAgICAgICAqIGluY2x1ZGluZyBhdHRhY2hlZCBjb21wb25lbnRzLCBjaGlsZHJlbiwgc3VwZXJjbGFzcy1vYmplY3RzXHJcbiAgICAgICAgICogQHBhcmFtIF9zZXJpYWxpemF0aW9uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICBsZXQgcmVjb25zdHJ1Y3Q6IFNlcmlhbGl6YWJsZTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIGxvb3AgY29uc3RydWN0ZWQgc29sZWx5IHRvIGFjY2VzcyB0eXBlLXByb3BlcnR5LiBPbmx5IG9uZSBleHBlY3RlZCFcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBhdGggaW4gX3NlcmlhbGl6YXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyByZWNvbnN0cnVjdCA9IG5ldyAoPEdlbmVyYWw+RnVkZ2UpW3R5cGVOYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICByZWNvbnN0cnVjdCA9IFNlcmlhbGl6ZXIucmVjb25zdHJ1Y3QocGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjb25zdHJ1Y3QuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bcGF0aF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNvbnN0cnVjdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGVzZXJpYWxpemF0aW9uIGZhaWxlZDogXCIgKyBtZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vVE9ETzogaW1wbGVtZW50IHByZXR0aWZpZXIgdG8gbWFrZSBKU09OLVN0cmluZ2lmaWNhdGlvbiBvZiBzZXJpYWxpemF0aW9ucyBtb3JlIHJlYWRhYmxlLCBlLmcuIHBsYWNpbmcgeCwgeSBhbmQgeiBpbiBvbmUgbGluZVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcHJldHRpZnkoX2pzb246IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBfanNvbjsgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgZm9ybWF0dGVkLCBodW1hbiByZWFkYWJsZSBKU09OLVN0cmluZywgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiBbW1NlcmlhbGl6YWlvbl1dIHRoYXQgbWF5IGhhdmUgYmVlbiBjcmVhdGVkIGJ5IFtbU2VyaWFsaXplcl1dLnNlcmlhbGl6ZVxyXG4gICAgICAgICAqIEBwYXJhbSBfc2VyaWFsaXphdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5naWZ5KF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgLy8gYWRqdXN0bWVudHMgdG8gc2VyaWFsaXphdGlvbiBjYW4gYmUgbWFkZSBoZXJlIGJlZm9yZSBzdHJpbmdpZmljYXRpb24sIGlmIGRlc2lyZWRcclxuICAgICAgICAgICAgbGV0IGpzb246IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KF9zZXJpYWxpemF0aW9uLCBudWxsLCAyKTtcclxuICAgICAgICAgICAgbGV0IHByZXR0eTogc3RyaW5nID0gU2VyaWFsaXplci5wcmV0dGlmeShqc29uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHByZXR0eTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBbW1NlcmlhbGl6YXRpb25dXSBjcmVhdGVkIGZyb20gdGhlIGdpdmVuIEpTT04tU3RyaW5nLiBSZXN1bHQgbWF5IGJlIHBhc3NlZCB0byBbW1NlcmlhbGl6ZXJdXS5kZXNlcmlhbGl6ZVxyXG4gICAgICAgICAqIEBwYXJhbSBfanNvbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHBhcnNlKF9qc29uOiBzdHJpbmcpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoX2pzb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCBvZiB0aGUgY2xhc3MgZGVmaW5lZCB3aXRoIHRoZSBmdWxsIHBhdGggaW5jbHVkaW5nIHRoZSBuYW1lc3BhY2VOYW1lKHMpIGFuZCB0aGUgY2xhc3NOYW1lIHNlcGVyYXRlZCBieSBkb3RzKC4pIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcGF0aCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWNvbnN0cnVjdChfcGF0aDogc3RyaW5nKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgbGV0IHR5cGVOYW1lOiBzdHJpbmcgPSBfcGF0aC5zdWJzdHIoX3BhdGgubGFzdEluZGV4T2YoXCIuXCIpICsgMSk7XHJcbiAgICAgICAgICAgIGxldCBuYW1lc3BhY2U6IE9iamVjdCA9IFNlcmlhbGl6ZXIuZ2V0TmFtZXNwYWNlKF9wYXRoKTtcclxuICAgICAgICAgICAgaWYgKCFuYW1lc3BhY2UpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hbWVzcGFjZSBvZiBzZXJpYWxpemFibGUgb2JqZWN0IG9mIHR5cGUgJHt0eXBlTmFtZX0gbm90IGZvdW5kLiBNYXliZSB0aGUgbmFtZXNwYWNlIGhhc24ndCBiZWVuIHJlZ2lzdGVyZWQ/YCk7XHJcbiAgICAgICAgICAgIGxldCByZWNvbnN0cnVjdGlvbjogU2VyaWFsaXphYmxlID0gbmV3ICg8R2VuZXJhbD5uYW1lc3BhY2UpW3R5cGVOYW1lXTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlY29uc3RydWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZnVsbCBwYXRoIHRvIHRoZSBjbGFzcyBvZiB0aGUgb2JqZWN0LCBpZiBmb3VuZCBpbiB0aGUgcmVnaXN0ZXJlZCBuYW1lc3BhY2VzXHJcbiAgICAgICAgICogQHBhcmFtIF9vYmplY3QgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2V0RnVsbFBhdGgoX29iamVjdDogU2VyaWFsaXphYmxlKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgbGV0IHR5cGVOYW1lOiBzdHJpbmcgPSBfb2JqZWN0LmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgICAgICAgIC8vIERlYnVnLmxvZyhcIlNlYXJjaGluZyBuYW1lc3BhY2Ugb2Y6IFwiICsgdHlwZU5hbWUpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBuYW1lc3BhY2VOYW1lIGluIFNlcmlhbGl6ZXIubmFtZXNwYWNlcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvdW5kOiBHZW5lcmFsID0gKDxHZW5lcmFsPlNlcmlhbGl6ZXIubmFtZXNwYWNlcylbbmFtZXNwYWNlTmFtZV1bdHlwZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kICYmIF9vYmplY3QgaW5zdGFuY2VvZiBmb3VuZClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmFtZXNwYWNlTmFtZSArIFwiLlwiICsgdHlwZU5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBuYW1lc3BhY2Utb2JqZWN0IGRlZmluZWQgd2l0aGluIHRoZSBmdWxsIHBhdGgsIGlmIHJlZ2lzdGVyZWRcclxuICAgICAgICAgKiBAcGFyYW0gX3BhdGhcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBnZXROYW1lc3BhY2UoX3BhdGg6IHN0cmluZyk6IE9iamVjdCB7XHJcbiAgICAgICAgICAgIGxldCBuYW1lc3BhY2VOYW1lOiBzdHJpbmcgPSBfcGF0aC5zdWJzdHIoMCwgX3BhdGgubGFzdEluZGV4T2YoXCIuXCIpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFNlcmlhbGl6ZXIubmFtZXNwYWNlc1tuYW1lc3BhY2VOYW1lXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpbmRzIHRoZSBuYW1lc3BhY2Utb2JqZWN0IGluIHByb3BlcnRpZXMgb2YgdGhlIHBhcmVudC1vYmplY3QgKGUuZy4gd2luZG93KSwgaWYgcHJlc2VudFxyXG4gICAgICAgICAqIEBwYXJhbSBfbmFtZXNwYWNlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcGFyZW50IFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGZpbmROYW1lc3BhY2VJbihfbmFtZXNwYWNlOiBPYmplY3QsIF9wYXJlbnQ6IE9iamVjdCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHByb3AgaW4gX3BhcmVudClcclxuICAgICAgICAgICAgICAgIGlmICgoPEdlbmVyYWw+X3BhcmVudClbcHJvcF0gPT0gX25hbWVzcGFjZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvcDtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEludGVyZmFjZSBkZXNjcmliaW5nIHRoZSBkYXRhdHlwZXMgb2YgdGhlIGF0dHJpYnV0ZXMgYSBtdXRhdG9yIGFzIHN0cmluZ3MgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTXV0YXRvckF0dHJpYnV0ZVR5cGVzIHtcclxuICAgICAgICBbYXR0cmlidXRlOiBzdHJpbmddOiBzdHJpbmcgfCBPYmplY3Q7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgbXV0YXRvciwgd2hpY2ggaXMgYW4gYXNzb2NpYXRpdmUgYXJyYXkgd2l0aCBuYW1lcyBvZiBhdHRyaWJ1dGVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE11dGF0b3Ige1xyXG4gICAgICAgIFthdHRyaWJ1dGU6IHN0cmluZ106IE9iamVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogSW50ZXJmYWNlcyBkZWRpY2F0ZWQgZm9yIGVhY2ggcHVycG9zZS4gRXh0cmEgYXR0cmlidXRlIG5lY2Vzc2FyeSBmb3IgY29tcGlsZXRpbWUgdHlwZSBjaGVja2luZywgbm90IGV4aXN0ZW50IGF0IHJ1bnRpbWVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNdXRhdG9yRm9yQW5pbWF0aW9uIGV4dGVuZHMgTXV0YXRvciB7IHJlYWRvbmx5IGZvckFuaW1hdGlvbjogbnVsbDsgfVxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNdXRhdG9yRm9yVXNlckludGVyZmFjZSBleHRlbmRzIE11dGF0b3IgeyByZWFkb25seSBmb3JVc2VySW50ZXJmYWNlOiBudWxsOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlIGNsYXNzIGZvciBhbGwgdHlwZXMgYmVpbmcgbXV0YWJsZSB1c2luZyBbW011dGF0b3JdXS1vYmplY3RzLCB0aHVzIHByb3ZpZGluZyBhbmQgdXNpbmcgaW50ZXJmYWNlcyBjcmVhdGVkIGF0IHJ1bnRpbWUuICBcclxuICAgICAqIE11dGFibGVzIHByb3ZpZGUgYSBbW011dGF0b3JdXSB0aGF0IGlzIGJ1aWxkIGJ5IGNvbGxlY3RpbmcgYWxsIG9iamVjdC1wcm9wZXJ0aWVzIHRoYXQgYXJlIGVpdGhlciBvZiBhIHByaW1pdGl2ZSB0eXBlIG9yIGFnYWluIE11dGFibGUuXHJcbiAgICAgKiBTdWJjbGFzc2VzIGNhbiBlaXRoZXIgcmVkdWNlIHRoZSBzdGFuZGFyZCBbW011dGF0b3JdXSBidWlsdCBieSB0aGlzIGJhc2UgY2xhc3MgYnkgZGVsZXRpbmcgcHJvcGVydGllcyBvciBpbXBsZW1lbnQgYW4gaW5kaXZpZHVhbCBnZXRNdXRhdG9yLW1ldGhvZC5cclxuICAgICAqIFRoZSBwcm92aWRlZCBwcm9wZXJ0aWVzIG9mIHRoZSBbW011dGF0b3JdXSBtdXN0IG1hdGNoIHB1YmxpYyBwcm9wZXJ0aWVzIG9yIGdldHRlcnMvc2V0dGVycyBvZiB0aGUgb2JqZWN0LlxyXG4gICAgICogT3RoZXJ3aXNlLCB0aGV5IHdpbGwgYmUgaWdub3JlZCBpZiBub3QgaGFuZGxlZCBieSBhbiBvdmVycmlkZSBvZiB0aGUgbXV0YXRlLW1ldGhvZCBpbiB0aGUgc3ViY2xhc3MgYW5kIHRocm93IGVycm9ycyBpbiBhbiBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCB1c2VyLWludGVyZmFjZSBmb3IgdGhlIG9iamVjdC5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIE11dGFibGUgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzIHRoZSB0eXBlIG9mIHRoaXMgbXV0YWJsZSBzdWJjbGFzcyBhcyB0aGUgbmFtZSBvZiB0aGUgcnVudGltZSBjbGFzc1xyXG4gICAgICAgICAqIEByZXR1cm5zIFRoZSB0eXBlIG9mIHRoZSBtdXRhYmxlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldCB0eXBlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbGxlY3QgYXBwbGljYWJsZSBhdHRyaWJ1dGVzIG9mIHRoZSBpbnN0YW5jZSBhbmQgY29waWVzIG9mIHRoZWlyIHZhbHVlcyBpbiBhIE11dGF0b3Itb2JqZWN0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgICAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBjb2xsZWN0IHByaW1pdGl2ZSBhbmQgbXV0YWJsZSBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IE9iamVjdCA9IHRoaXNbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgT2JqZWN0ICYmICEodmFsdWUgaW5zdGFuY2VvZiBNdXRhYmxlKSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIG11dGF0b3JbYXR0cmlidXRlXSA9IHRoaXNbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gbXV0YXRvciBjYW4gYmUgcmVkdWNlZCBidXQgbm90IGV4dGVuZGVkIVxyXG4gICAgICAgICAgICBPYmplY3QucHJldmVudEV4dGVuc2lvbnMobXV0YXRvcik7XHJcbiAgICAgICAgICAgIC8vIGRlbGV0ZSB1bndhbnRlZCBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgIHRoaXMucmVkdWNlTXV0YXRvcihtdXRhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlcGxhY2UgcmVmZXJlbmNlcyB0byBtdXRhYmxlIG9iamVjdHMgd2l0aCByZWZlcmVuY2VzIHRvIGNvcGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGUgaW4gbXV0YXRvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBPYmplY3QgPSBtdXRhdG9yW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBNdXRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIG11dGF0b3JbYXR0cmlidXRlXSA9IHZhbHVlLmdldE11dGF0b3IoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG11dGF0b3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb2xsZWN0IHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBpbnN0YW5jZSBhbmQgdGhlaXIgdmFsdWVzIGFwcGxpY2FibGUgZm9yIGFuaW1hdGlvbi5cclxuICAgICAgICAgKiBCYXNpYyBmdW5jdGlvbmFsaXR5IGlzIGlkZW50aWNhbCB0byBbW2dldE11dGF0b3JdXSwgcmV0dXJuZWQgbXV0YXRvciBzaG91bGQgdGhlbiBiZSByZWR1Y2VkIGJ5IHRoZSBzdWJjbGFzc2VkIGluc3RhbmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3JGb3JBbmltYXRpb24oKTogTXV0YXRvckZvckFuaW1hdGlvbiB7XHJcbiAgICAgICAgICAgIHJldHVybiA8TXV0YXRvckZvckFuaW1hdGlvbj50aGlzLmdldE11dGF0b3IoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29sbGVjdCB0aGUgYXR0cmlidXRlcyBvZiB0aGUgaW5zdGFuY2UgYW5kIHRoZWlyIHZhbHVlcyBhcHBsaWNhYmxlIGZvciB0aGUgdXNlciBpbnRlcmZhY2UuXHJcbiAgICAgICAgICogQmFzaWMgZnVuY3Rpb25hbGl0eSBpcyBpZGVudGljYWwgdG8gW1tnZXRNdXRhdG9yXV0sIHJldHVybmVkIG11dGF0b3Igc2hvdWxkIHRoZW4gYmUgcmVkdWNlZCBieSB0aGUgc3ViY2xhc3NlZCBpbnN0YW5jZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yRm9yVXNlckludGVyZmFjZSgpOiBNdXRhdG9yRm9yVXNlckludGVyZmFjZSB7XHJcbiAgICAgICAgICAgIHJldHVybiA8TXV0YXRvckZvclVzZXJJbnRlcmZhY2U+dGhpcy5nZXRNdXRhdG9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gYXNzb2NpYXRpdmUgYXJyYXkgd2l0aCB0aGUgc2FtZSBhdHRyaWJ1dGVzIGFzIHRoZSBnaXZlbiBtdXRhdG9yLCBidXQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyB0eXBlcyBhcyBzdHJpbmctdmFsdWVzXHJcbiAgICAgICAgICogRG9lcyBub3QgcmVjdXJzZSBpbnRvIG9iamVjdHMhXHJcbiAgICAgICAgICogQHBhcmFtIF9tdXRhdG9yIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3I6IE11dGF0b3IpOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMge1xyXG4gICAgICAgICAgICBsZXQgdHlwZXM6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGUgaW4gX211dGF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBudW1iZXIgfCBib29sZWFuIHwgc3RyaW5nIHwgb2JqZWN0ID0gX211dGF0b3JbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGlmIChfbXV0YXRvclthdHRyaWJ1dGVdICE9IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh2YWx1ZSkgPT0gXCJvYmplY3RcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICg8R2VuZXJhbD50aGlzKVthdHRyaWJ1dGVdLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gX211dGF0b3JbYXR0cmlidXRlXS5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgICAgICAgICAgdHlwZXNbYXR0cmlidXRlXSA9IHR5cGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGVzIHRoZSB2YWx1ZXMgb2YgdGhlIGdpdmVuIG11dGF0b3IgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBpbnN0YW5jZVxyXG4gICAgICAgICAqIEBwYXJhbSBfbXV0YXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdXBkYXRlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGUgaW4gX211dGF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogT2JqZWN0ID0gX211dGF0b3JbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE11dGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5nZXRNdXRhdG9yKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgX211dGF0b3JbYXR0cmlidXRlXSA9ICg8R2VuZXJhbD50aGlzKVthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGF0dHJpYnV0ZSB2YWx1ZXMgb2YgdGhlIGluc3RhbmNlIGFjY29yZGluZyB0byB0aGUgc3RhdGUgb2YgdGhlIG11dGF0b3IuIE11c3QgYmUgcHJvdGVjdGVkLi4uIVxyXG4gICAgICAgICAqIEBwYXJhbSBfbXV0YXRvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBtdXRhdGUoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogZG9uJ3QgYXNzaWduIHVua25vd24gcHJvcGVydGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGUgaW4gX211dGF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogTXV0YXRvciA9IDxNdXRhdG9yPl9tdXRhdG9yW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBsZXQgbXV0YW50OiBPYmplY3QgPSAoPEdlbmVyYWw+dGhpcylbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGlmIChtdXRhbnQgaW5zdGFuY2VvZiBNdXRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIG11dGFudC5tdXRhdGUodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICg8R2VuZXJhbD50aGlzKVthdHRyaWJ1dGVdID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5NVVRBVEUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVkdWNlcyB0aGUgYXR0cmlidXRlcyBvZiB0aGUgZ2VuZXJhbCBtdXRhdG9yIGFjY29yZGluZyB0byBkZXNpcmVkIG9wdGlvbnMgZm9yIG11dGF0aW9uLiBUbyBiZSBpbXBsZW1lbnRlZCBpbiBzdWJjbGFzc2VzXHJcbiAgICAgICAgICogQHBhcmFtIF9tdXRhdG9yIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZDtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvU2VyaWFsaXplci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL011dGFibGUudHNcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQW5pbWF0aW9uU3RydWN0dXJlIHRoYXQgdGhlIEFuaW1hdGlvbiB1c2VzIHRvIG1hcCB0aGUgU2VxdWVuY2VzIHRvIHRoZSBBdHRyaWJ1dGVzLlxyXG4gICAqIEJ1aWx0IG91dCBvZiBhIFtbTm9kZV1dJ3Mgc2VyaWFsc2F0aW9uLCBpdCBzd2FwcyB0aGUgdmFsdWVzIHdpdGggW1tBbmltYXRpb25TZXF1ZW5jZV1dcy5cclxuICAgKi9cclxuICBleHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0cnVjdHVyZSB7XHJcbiAgICBbYXR0cmlidXRlOiBzdHJpbmddOiBTZXJpYWxpemF0aW9uIHwgQW5pbWF0aW9uU2VxdWVuY2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIEFuIGFzc29jaWF0aXZlIGFycmF5IG1hcHBpbmcgbmFtZXMgb2YgbGFibGVzIHRvIHRpbWVzdGFtcHMuXHJcbiAgKiBMYWJlbHMgbmVlZCB0byBiZSB1bmlxdWUgcGVyIEFuaW1hdGlvbi5cclxuICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAqL1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uTGFiZWwge1xyXG4gICAgW25hbWU6IHN0cmluZ106IG51bWJlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgQW5pbWF0aW9uIEV2ZW50IFRyaWdnZXJzXHJcbiAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgKi9cclxuICBleHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB7XHJcbiAgICBbbmFtZTogc3RyaW5nXTogbnVtYmVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJuYWxseSB1c2VkIHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiB0aGUgdmFyaW91cyBnZW5lcmF0ZWQgc3RydWN0dXJlcyBhbmQgZXZlbnRzLlxyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBlbnVtIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSB7XHJcbiAgICAvKipEZWZhdWx0OiBmb3J3YXJkLCBjb250aW5vdXMgKi9cclxuICAgIE5PUk1BTCxcclxuICAgIC8qKmJhY2t3YXJkLCBjb250aW5vdXMgKi9cclxuICAgIFJFVkVSU0UsXHJcbiAgICAvKipmb3J3YXJkLCByYXN0ZXJlZCAqL1xyXG4gICAgUkFTVEVSRUQsXHJcbiAgICAvKipiYWNrd2FyZCwgcmFzdGVyZWQgKi9cclxuICAgIFJBU1RFUkVEUkVWRVJTRVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0aW9uIENsYXNzIHRvIGhvbGQgYWxsIHJlcXVpcmVkIE9iamVjdHMgdGhhdCBhcmUgcGFydCBvZiBhbiBBbmltYXRpb24uXHJcbiAgICogQWxzbyBob2xkcyBmdW5jdGlvbnMgdG8gcGxheSBzYWlkIEFuaW1hdGlvbi5cclxuICAgKiBDYW4gYmUgYWRkZWQgdG8gYSBOb2RlIGFuZCBwbGF5ZWQgdGhyb3VnaCBbW0NvbXBvbmVudEFuaW1hdG9yXV0uXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBBbmltYXRpb24gZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgaWRSZXNvdXJjZTogc3RyaW5nO1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgdG90YWxUaW1lOiBudW1iZXIgPSAwO1xyXG4gICAgbGFiZWxzOiBBbmltYXRpb25MYWJlbCA9IHt9O1xyXG4gICAgc3RlcHNQZXJTZWNvbmQ6IG51bWJlciA9IDEwO1xyXG4gICAgYW5pbWF0aW9uU3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmU7XHJcbiAgICBldmVudHM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciA9IHt9O1xyXG4gICAgcHJpdmF0ZSBmcmFtZXNQZXJTZWNvbmQ6IG51bWJlciA9IDYwO1xyXG5cclxuICAgIC8vIHByb2Nlc3NlZCBldmVudGxpc3QgYW5kIGFuaW1hdGlvbiBzdHJ1Y3V0cmVzIGZvciBwbGF5YmFjay5cclxuICAgIHByaXZhdGUgZXZlbnRzUHJvY2Vzc2VkOiBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25FdmVudFRyaWdnZXI+ID0gbmV3IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvbkV2ZW50VHJpZ2dlcj4oKTtcclxuICAgIHByaXZhdGUgYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZDogTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uU3RydWN0dXJlPiA9IG5ldyBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25TdHJ1Y3R1cmU+KCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX2FuaW1TdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSA9IHt9LCBfZnBzOiBudW1iZXIgPSA2MCkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLm5hbWUgPSBfbmFtZTtcclxuICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUgPSBfYW5pbVN0cnVjdHVyZTtcclxuICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLnNldChBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMLCBfYW5pbVN0cnVjdHVyZSk7XHJcbiAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gX2ZwcztcclxuICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlcyBhIG5ldyBcIk11dGF0b3JcIiB3aXRoIHRoZSBpbmZvcm1hdGlvbiB0byBhcHBseSB0byB0aGUgW1tOb2RlXV0gdGhlIFtbQ29tcG9uZW50QW5pbWF0b3JdXSBpcyBhdHRhY2hlZCB0byB3aXRoIFtbTm9kZS5hcHBseUFuaW1hdGlvbigpXV0uXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgVGhlIHRpbWUgYXQgd2hpY2ggdGhlIGFuaW1hdGlvbiBjdXJyZW50bHkgaXMgYXRcclxuICAgICAqIEBwYXJhbSBfZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggdGhlIGFuaW1hdGlvbiBpcyBzdXBwb3NlZCB0byBiZSBwbGF5aW5nIGJhY2suID4wID09IGZvcndhcmQsIDAgPT0gc3RvcCwgPDAgPT0gYmFja3dhcmRzXHJcbiAgICAgKiBAcGFyYW0gX3BsYXliYWNrIFRoZSBwbGF5YmFja21vZGUgdGhlIGFuaW1hdGlvbiBpcyBzdXBwb3NlZCB0byBiZSBjYWxjdWxhdGVkIHdpdGguXHJcbiAgICAgKiBAcmV0dXJucyBhIFwiTXV0YXRvclwiIHRvIGFwcGx5LlxyXG4gICAgICovXHJcbiAgICBnZXRNdXRhdGVkKF90aW1lOiBudW1iZXIsIF9kaXJlY3Rpb246IG51bWJlciwgX3BsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0spOiBNdXRhdG9yIHsgICAgIC8vVE9ETzogZmluZCBhIGJldHRlciBuYW1lIGZvciB0aGlzXHJcbiAgICAgIGxldCBtOiBNdXRhdG9yID0ge307XHJcbiAgICAgIGlmIChfcGxheWJhY2sgPT0gQU5JTUFUSU9OX1BMQVlCQUNLLlRJTUVCQVNFRF9DT05USU5PVVMpIHtcclxuICAgICAgICBpZiAoX2RpcmVjdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICBtID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IodGhpcy5nZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTCksIF90aW1lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFKSwgX3RpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoX2RpcmVjdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICBtID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IodGhpcy5nZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEKSwgX3RpbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IodGhpcy5nZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEUkVWRVJTRSksIF90aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGxpc3Qgb2YgdGhlIG5hbWVzIG9mIHRoZSBldmVudHMgdGhlIFtbQ29tcG9uZW50QW5pbWF0b3JdXSBuZWVkcyB0byBmaXJlIGJldHdlZW4gX21pbiBhbmQgX21heC4gXHJcbiAgICAgKiBAcGFyYW0gX21pbiBUaGUgbWluaW11bSB0aW1lIChpbmNsdXNpdmUpIHRvIGNoZWNrIGJldHdlZW5cclxuICAgICAqIEBwYXJhbSBfbWF4IFRoZSBtYXhpbXVtIHRpbWUgKGV4Y2x1c2l2ZSkgdG8gY2hlY2sgYmV0d2VlblxyXG4gICAgICogQHBhcmFtIF9wbGF5YmFjayBUaGUgcGxheWJhY2sgbW9kZSB0byBjaGVjayBpbi4gSGFzIGFuIGVmZmVjdCBvbiB3aGVuIHRoZSBFdmVudHMgYXJlIGZpcmVkLiBcclxuICAgICAqIEBwYXJhbSBfZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gdGhlIGFuaW1hdGlvbiBpcyBzdXBwb3NlZCB0byBydW4gaW4uID4wID09IGZvcndhcmQsIDAgPT0gc3RvcCwgPDAgPT0gYmFja3dhcmRzXHJcbiAgICAgKiBAcmV0dXJucyBhIGxpc3Qgb2Ygc3RyaW5ncyB3aXRoIHRoZSBuYW1lcyBvZiB0aGUgY3VzdG9tIGV2ZW50cyB0byBmaXJlLlxyXG4gICAgICovXHJcbiAgICBnZXRFdmVudHNUb0ZpcmUoX21pbjogbnVtYmVyLCBfbWF4OiBudW1iZXIsIF9wbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLLCBfZGlyZWN0aW9uOiBudW1iZXIpOiBzdHJpbmdbXSB7XHJcbiAgICAgIGxldCBldmVudExpc3Q6IHN0cmluZ1tdID0gW107XHJcbiAgICAgIGxldCBtaW5TZWN0aW9uOiBudW1iZXIgPSBNYXRoLmZsb29yKF9taW4gLyB0aGlzLnRvdGFsVGltZSk7XHJcbiAgICAgIGxldCBtYXhTZWN0aW9uOiBudW1iZXIgPSBNYXRoLmZsb29yKF9tYXggLyB0aGlzLnRvdGFsVGltZSk7XHJcbiAgICAgIF9taW4gPSBfbWluICUgdGhpcy50b3RhbFRpbWU7XHJcbiAgICAgIF9tYXggPSBfbWF4ICUgdGhpcy50b3RhbFRpbWU7XHJcblxyXG4gICAgICB3aGlsZSAobWluU2VjdGlvbiA8PSBtYXhTZWN0aW9uKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50VHJpZ2dlcnM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciA9IHRoaXMuZ2V0Q29ycmVjdEV2ZW50TGlzdChfZGlyZWN0aW9uLCBfcGxheWJhY2spO1xyXG4gICAgICAgIGlmIChtaW5TZWN0aW9uID09IG1heFNlY3Rpb24pIHtcclxuICAgICAgICAgIGV2ZW50TGlzdCA9IGV2ZW50TGlzdC5jb25jYXQodGhpcy5jaGVja0V2ZW50c0JldHdlZW4oZXZlbnRUcmlnZ2VycywgX21pbiwgX21heCkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBldmVudExpc3QgPSBldmVudExpc3QuY29uY2F0KHRoaXMuY2hlY2tFdmVudHNCZXR3ZWVuKGV2ZW50VHJpZ2dlcnMsIF9taW4sIHRoaXMudG90YWxUaW1lKSk7XHJcbiAgICAgICAgICBfbWluID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWluU2VjdGlvbisrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZXZlbnRMaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBFdmVudCB0byB0aGUgTGlzdCBvZiBldmVudHMuXHJcbiAgICAgKiBAcGFyYW0gX25hbWUgVGhlIG5hbWUgb2YgdGhlIGV2ZW50IChuZWVkcyB0byBiZSB1bmlxdWUgcGVyIEFuaW1hdGlvbikuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgVGhlIHRpbWVzdGFtcCBvZiB0aGUgZXZlbnQgKGluIG1pbGxpc2Vjb25kcykuXHJcbiAgICAgKi9cclxuICAgIHNldEV2ZW50KF9uYW1lOiBzdHJpbmcsIF90aW1lOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5ldmVudHNbX25hbWVdID0gX3RpbWU7XHJcbiAgICAgIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLmNsZWFyKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgZXZlbnQgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBmcm9tIHRoZSBsaXN0IG9mIGV2ZW50cy5cclxuICAgICAqIEBwYXJhbSBfbmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byByZW1vdmUuXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUV2ZW50KF9uYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgZGVsZXRlIHRoaXMuZXZlbnRzW19uYW1lXTtcclxuICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZ2V0TGFiZWxzKCk6IEVudW1lcmF0b3Ige1xyXG4gICAgICAvL1RPRE86IHRoaXMgYWN0dWFsbHkgbmVlZHMgdGVzdGluZ1xyXG4gICAgICBsZXQgZW46IEVudW1lcmF0b3IgPSBuZXcgRW51bWVyYXRvcih0aGlzLmxhYmVscyk7XHJcbiAgICAgIHJldHVybiBlbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZnBzKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZyYW1lc1BlclNlY29uZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgZnBzKF9mcHM6IG51bWJlcikge1xyXG4gICAgICB0aGlzLmZyYW1lc1BlclNlY29uZCA9IF9mcHM7XHJcbiAgICAgIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLmNsZWFyKCk7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKFJlLSlDYWxjdWxhdGUgdGhlIHRvdGFsIHRpbWUgb2YgdGhlIEFuaW1hdGlvbi4gQ2FsY3VsYXRpb24taGVhdnksIHVzZSBvbmx5IGlmIGFjdHVhbGx5IG5lZWRlZC5cclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlVG90YWxUaW1lKCk6IHZvaWQge1xyXG4gICAgICB0aGlzLnRvdGFsVGltZSA9IDA7XHJcbiAgICAgIHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JUaW1lKHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyNyZWdpb24gdHJhbnNmZXJcclxuICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IHM6IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgaWRSZXNvdXJjZTogdGhpcy5pZFJlc291cmNlLFxyXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICBsYWJlbHM6IHt9LFxyXG4gICAgICAgIGV2ZW50czoge30sXHJcbiAgICAgICAgZnBzOiB0aGlzLmZyYW1lc1BlclNlY29uZCxcclxuICAgICAgICBzcHM6IHRoaXMuc3RlcHNQZXJTZWNvbmRcclxuICAgICAgfTtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiB0aGlzLmxhYmVscykge1xyXG4gICAgICAgIHMubGFiZWxzW25hbWVdID0gdGhpcy5sYWJlbHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiB0aGlzLmV2ZW50cykge1xyXG4gICAgICAgIHMuZXZlbnRzW25hbWVdID0gdGhpcy5ldmVudHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgcy5hbmltYXRpb25TdHJ1Y3R1cmUgPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yU2VyaWFsaXNhdGlvbih0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSk7XHJcbiAgICAgIHJldHVybiBzO1xyXG4gICAgfVxyXG4gICAgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICB0aGlzLmlkUmVzb3VyY2UgPSBfc2VyaWFsaXphdGlvbi5pZFJlc291cmNlO1xyXG4gICAgICB0aGlzLm5hbWUgPSBfc2VyaWFsaXphdGlvbi5uYW1lO1xyXG4gICAgICB0aGlzLmZyYW1lc1BlclNlY29uZCA9IF9zZXJpYWxpemF0aW9uLmZwcztcclxuICAgICAgdGhpcy5zdGVwc1BlclNlY29uZCA9IF9zZXJpYWxpemF0aW9uLnNwcztcclxuICAgICAgdGhpcy5sYWJlbHMgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfc2VyaWFsaXphdGlvbi5sYWJlbHMpIHtcclxuICAgICAgICB0aGlzLmxhYmVsc1tuYW1lXSA9IF9zZXJpYWxpemF0aW9uLmxhYmVsc1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmV2ZW50cyA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9zZXJpYWxpemF0aW9uLmV2ZW50cykge1xyXG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gX3NlcmlhbGl6YXRpb24uZXZlbnRzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZXZlbnRzUHJvY2Vzc2VkID0gbmV3IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvbkV2ZW50VHJpZ2dlcj4oKTtcclxuXHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvckRlc2VyaWFsaXNhdGlvbihfc2VyaWFsaXphdGlvbi5hbmltYXRpb25TdHJ1Y3R1cmUpO1xyXG5cclxuICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkID0gbmV3IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvblN0cnVjdHVyZT4oKTtcclxuXHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxUaW1lKCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZSgpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgZGVsZXRlIF9tdXRhdG9yLnRvdGFsVGltZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIGFuIEFuaW1hdGlvblN0cnVjdHVyZSBhbmQgcmV0dXJucyB0aGUgU2VyaWFsaXphdGlvbiBvZiBzYWlkIFN0cnVjdHVyZS5cclxuICAgICAqIEBwYXJhbSBfc3RydWN0dXJlIFRoZSBBbmltYXRpb24gU3RydWN0dXJlIGF0IHRoZSBjdXJyZW50IGxldmVsIHRvIHRyYW5zZm9ybSBpbnRvIHRoZSBTZXJpYWxpemF0aW9uLlxyXG4gICAgICogQHJldHVybnMgdGhlIGZpbGxlZCBTZXJpYWxpemF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYXZlcnNlU3RydWN0dXJlRm9yU2VyaWFsaXNhdGlvbihfc3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IG5ld1NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7fTtcclxuICAgICAgZm9yIChsZXQgbiBpbiBfc3RydWN0dXJlKSB7XHJcbiAgICAgICAgaWYgKF9zdHJ1Y3R1cmVbbl0gaW5zdGFuY2VvZiBBbmltYXRpb25TZXF1ZW5jZSkge1xyXG4gICAgICAgICAgbmV3U2VyaWFsaXphdGlvbltuXSA9IF9zdHJ1Y3R1cmVbbl0uc2VyaWFsaXplKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld1NlcmlhbGl6YXRpb25bbl0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yU2VyaWFsaXNhdGlvbig8QW5pbWF0aW9uU3RydWN0dXJlPl9zdHJ1Y3R1cmVbbl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3U2VyaWFsaXphdGlvbjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIGEgU2VyaWFsaXphdGlvbiB0byBjcmVhdGUgYSBuZXcgQW5pbWF0aW9uU3RydWN0dXJlLlxyXG4gICAgICogQHBhcmFtIF9zZXJpYWxpemF0aW9uIFRoZSBzZXJpYWxpemF0aW9uIHRvIHRyYW5zZmVyIGludG8gYW4gQW5pbWF0aW9uU3RydWN0dXJlXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgbmV3bHkgY3JlYXRlZCBBbmltYXRpb25TdHJ1Y3R1cmUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JEZXNlcmlhbGlzYXRpb24oX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBBbmltYXRpb25TdHJ1Y3R1cmUge1xyXG4gICAgICBsZXQgbmV3U3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbiBpbiBfc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgIGlmIChfc2VyaWFsaXphdGlvbltuXS5hbmltYXRpb25TZXF1ZW5jZSkge1xyXG4gICAgICAgICAgbGV0IGFuaW1TZXE6IEFuaW1hdGlvblNlcXVlbmNlID0gbmV3IEFuaW1hdGlvblNlcXVlbmNlKCk7XHJcbiAgICAgICAgICBuZXdTdHJ1Y3R1cmVbbl0gPSBhbmltU2VxLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW25dKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3U3RydWN0dXJlW25dID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvckRlc2VyaWFsaXNhdGlvbihfc2VyaWFsaXphdGlvbltuXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXdTdHJ1Y3R1cmU7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmRzIHRoZSBsaXN0IG9mIGV2ZW50cyB0byBiZSB1c2VkIHdpdGggdGhlc2Ugc2V0dGluZ3MuXHJcbiAgICAgKiBAcGFyYW0gX2RpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIHRoZSBhbmltYXRpb24gaXMgcGxheWluZyBpbi5cclxuICAgICAqIEBwYXJhbSBfcGxheWJhY2sgVGhlIHBsYXliYWNrbW9kZSB0aGUgYW5pbWF0aW9uIGlzIHBsYXlpbmcgaW4uXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY29ycmVjdCBBbmltYXRpb25FdmVudFRyaWdnZXIgT2JqZWN0IHRvIHVzZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldENvcnJlY3RFdmVudExpc3QoX2RpcmVjdGlvbjogbnVtYmVyLCBfcGxheWJhY2s6IEFOSU1BVElPTl9QTEFZQkFDSyk6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB7XHJcbiAgICAgIGlmIChfcGxheWJhY2sgIT0gQU5JTUFUSU9OX1BMQVlCQUNLLkZSQU1FQkFTRUQpIHtcclxuICAgICAgICBpZiAoX2RpcmVjdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChfZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRUQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEUkVWRVJTRSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgYW4gQW5pbWF0aW9uU3RydWN0dXJlIHRvIHR1cm4gaXQgaW50byB0aGUgXCJNdXRhdG9yXCIgdG8gcmV0dXJuIHRvIHRoZSBDb21wb25lbnQuXHJcbiAgICAgKiBAcGFyYW0gX3N0cnVjdHVyZSBUaGUgc3RyY3V0dXJlIHRvIHRyYXZlcnNlXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlIHBvaW50IGluIHRpbWUgdG8gd3JpdGUgdGhlIGFuaW1hdGlvbiBudW1iZXJzIGludG8uXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgXCJNdXRhdG9yXCIgZmlsbGVkIHdpdGggdGhlIGNvcnJlY3QgdmFsdWVzIGF0IHRoZSBnaXZlbiB0aW1lLiBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IoX3N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlLCBfdGltZTogbnVtYmVyKTogTXV0YXRvciB7XHJcbiAgICAgIGxldCBuZXdNdXRhdG9yOiBNdXRhdG9yID0ge307XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX3N0cnVjdHVyZSkge1xyXG4gICAgICAgIGlmIChfc3RydWN0dXJlW25dIGluc3RhbmNlb2YgQW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIG5ld011dGF0b3Jbbl0gPSAoPEFuaW1hdGlvblNlcXVlbmNlPl9zdHJ1Y3R1cmVbbl0pLmV2YWx1YXRlKF90aW1lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3TXV0YXRvcltuXSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKDxBbmltYXRpb25TdHJ1Y3R1cmU+X3N0cnVjdHVyZVtuXSwgX3RpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3TXV0YXRvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyB0aGUgY3VycmVudCBBbmltYXRpb25TdHJjdXR1cmUgdG8gZmluZCB0aGUgdG90YWxUaW1lIG9mIHRoaXMgYW5pbWF0aW9uLlxyXG4gICAgICogQHBhcmFtIF9zdHJ1Y3R1cmUgVGhlIHN0cnVjdHVyZSB0byB0cmF2ZXJzZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYXZlcnNlU3RydWN0dXJlRm9yVGltZShfc3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUpOiB2b2lkIHtcclxuICAgICAgZm9yIChsZXQgbiBpbiBfc3RydWN0dXJlKSB7XHJcbiAgICAgICAgaWYgKF9zdHJ1Y3R1cmVbbl0gaW5zdGFuY2VvZiBBbmltYXRpb25TZXF1ZW5jZSkge1xyXG4gICAgICAgICAgbGV0IHNlcXVlbmNlOiBBbmltYXRpb25TZXF1ZW5jZSA9IDxBbmltYXRpb25TZXF1ZW5jZT5fc3RydWN0dXJlW25dO1xyXG4gICAgICAgICAgaWYgKHNlcXVlbmNlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IHNlcXVlbmNlVGltZTogbnVtYmVyID0gc2VxdWVuY2UuZ2V0S2V5KHNlcXVlbmNlLmxlbmd0aCAtIDEpLlRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMudG90YWxUaW1lID0gc2VxdWVuY2VUaW1lID4gdGhpcy50b3RhbFRpbWUgPyBzZXF1ZW5jZVRpbWUgOiB0aGlzLnRvdGFsVGltZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvclRpbWUoPEFuaW1hdGlvblN0cnVjdHVyZT5fc3RydWN0dXJlW25dKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuc3VyZXMgdGhlIGV4aXN0YW5jZSBvZiB0aGUgcmVxdWVzdGVkIFtbQW5pbWF0aW9uU3RyY3V0dXJlXV0gYW5kIHJldHVybnMgaXQuXHJcbiAgICAgKiBAcGFyYW0gX3R5cGUgdGhlIHR5cGUgb2YgdGhlIHN0cnVjdHVyZSB0byBnZXRcclxuICAgICAqIEByZXR1cm5zIHRoZSByZXF1ZXN0ZWQgW1tBbmltYXRpb25TdHJ1Y3R1cmVdXVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShfdHlwZTogQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFKTogQW5pbWF0aW9uU3RydWN0dXJlIHtcclxuICAgICAgaWYgKCF0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuaGFzKF90eXBlKSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxUaW1lKCk7XHJcbiAgICAgICAgbGV0IGFlOiBBbmltYXRpb25TdHJ1Y3R1cmUgPSB7fTtcclxuICAgICAgICBzd2l0Y2ggKF90eXBlKSB7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUw6XHJcbiAgICAgICAgICAgIGFlID0gdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRTpcclxuICAgICAgICAgICAgYWUgPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTmV3U3RydWN0dXJlKHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlLCB0aGlzLmNhbGN1bGF0ZVJldmVyc2VTZXF1ZW5jZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRDpcclxuICAgICAgICAgICAgYWUgPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTmV3U3RydWN0dXJlKHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlLCB0aGlzLmNhbGN1bGF0ZVJhc3RlcmVkU2VxdWVuY2UuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRURSRVZFUlNFOlxyXG4gICAgICAgICAgICBhZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUodGhpcy5nZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0UpLCB0aGlzLmNhbGN1bGF0ZVJhc3RlcmVkU2VxdWVuY2UuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuc2V0KF90eXBlLCBhZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5nZXQoX3R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5zdXJlcyB0aGUgZXhpc3RhbmNlIG9mIHRoZSByZXF1ZXN0ZWQgW1tBbmltYXRpb25FdmVudFRyaWdnZXJdXSBhbmQgcmV0dXJucyBpdC5cclxuICAgICAqIEBwYXJhbSBfdHlwZSBUaGUgdHlwZSBvZiBBbmltYXRpb25FdmVudFRyaWdnZXIgdG8gZ2V0XHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmVxdWVzdGVkIFtbQW5pbWF0aW9uRXZlbnRUcmlnZ2VyXV1cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoX3R5cGU6IEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSk6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB7XHJcbiAgICAgIGlmICghdGhpcy5ldmVudHNQcm9jZXNzZWQuaGFzKF90eXBlKSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxUaW1lKCk7XHJcbiAgICAgICAgbGV0IGV2OiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB7fTtcclxuICAgICAgICBzd2l0Y2ggKF90eXBlKSB7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUw6XHJcbiAgICAgICAgICAgIGV2ID0gdGhpcy5ldmVudHM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRTpcclxuICAgICAgICAgICAgZXYgPSB0aGlzLmNhbGN1bGF0ZVJldmVyc2VFdmVudFRyaWdnZXJzKHRoaXMuZXZlbnRzKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRDpcclxuICAgICAgICAgICAgZXYgPSB0aGlzLmNhbGN1bGF0ZVJhc3RlcmVkRXZlbnRUcmlnZ2Vycyh0aGlzLmV2ZW50cyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRURSRVZFUlNFOlxyXG4gICAgICAgICAgICBldiA9IHRoaXMuY2FsY3VsYXRlUmFzdGVyZWRFdmVudFRyaWdnZXJzKHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5zZXQoX3R5cGUsIGV2KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5ldmVudHNQcm9jZXNzZWQuZ2V0KF90eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyBhbiBleGlzdGluZyBzdHJ1Y3R1cmUgdG8gYXBwbHkgYSByZWNhbGN1bGF0aW9uIGZ1bmN0aW9uIHRvIHRoZSBBbmltYXRpb25TdHJ1Y3R1cmUgdG8gc3RvcmUgaW4gYSBuZXcgU3RydWN0dXJlLlxyXG4gICAgICogQHBhcmFtIF9vbGRTdHJ1Y3R1cmUgVGhlIG9sZCBzdHJ1Y3R1cmUgdG8gdHJhdmVyc2VcclxuICAgICAqIEBwYXJhbSBfZnVuY3Rpb25Ub1VzZSBUaGUgZnVuY3Rpb24gdG8gdXNlIHRvIHJlY2FsY3VsYXRlZCB0aGUgc3RydWN0dXJlLlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgQW5pbWF0aW9uIFN0cnVjdHVyZSB3aXRoIHRoZSByZWNhbHVsYXRlZCBBbmltYXRpb24gU2VxdWVuY2VzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYXZlcnNlU3RydWN0dXJlRm9yTmV3U3RydWN0dXJlKF9vbGRTdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSwgX2Z1bmN0aW9uVG9Vc2U6IEZ1bmN0aW9uKTogQW5pbWF0aW9uU3RydWN0dXJlIHtcclxuICAgICAgbGV0IG5ld1N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlID0ge307XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX29sZFN0cnVjdHVyZSkge1xyXG4gICAgICAgIGlmIChfb2xkU3RydWN0dXJlW25dIGluc3RhbmNlb2YgQW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIG5ld1N0cnVjdHVyZVtuXSA9IF9mdW5jdGlvblRvVXNlKF9vbGRTdHJ1Y3R1cmVbbl0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdTdHJ1Y3R1cmVbbl0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTmV3U3RydWN0dXJlKDxBbmltYXRpb25TdHJ1Y3R1cmU+X29sZFN0cnVjdHVyZVtuXSwgX2Z1bmN0aW9uVG9Vc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3U3RydWN0dXJlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIHJldmVyc2VkIEFuaW1hdGlvbiBTZXF1ZW5jZSBvdXQgb2YgYSBnaXZlbiBTZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBfc2VxdWVuY2UgVGhlIHNlcXVlbmNlIHRvIGNhbGN1bGF0ZSB0aGUgbmV3IHNlcXVlbmNlIG91dCBvZlxyXG4gICAgICogQHJldHVybnMgVGhlIHJldmVyc2VkIFNlcXVlbmNlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUmV2ZXJzZVNlcXVlbmNlKF9zZXF1ZW5jZTogQW5pbWF0aW9uU2VxdWVuY2UpOiBBbmltYXRpb25TZXF1ZW5jZSB7XHJcbiAgICAgIGxldCBzZXE6IEFuaW1hdGlvblNlcXVlbmNlID0gbmV3IEFuaW1hdGlvblNlcXVlbmNlKCk7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBfc2VxdWVuY2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgb2xkS2V5OiBBbmltYXRpb25LZXkgPSBfc2VxdWVuY2UuZ2V0S2V5KGkpO1xyXG4gICAgICAgIGxldCBrZXk6IEFuaW1hdGlvbktleSA9IG5ldyBBbmltYXRpb25LZXkodGhpcy50b3RhbFRpbWUgLSBvbGRLZXkuVGltZSwgb2xkS2V5LlZhbHVlLCBvbGRLZXkuU2xvcGVPdXQsIG9sZEtleS5TbG9wZUluLCBvbGRLZXkuQ29uc3RhbnQpO1xyXG4gICAgICAgIHNlcS5hZGRLZXkoa2V5KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc2VxO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIHJhc3RlcmVkIFtbQW5pbWF0aW9uU2VxdWVuY2VdXSBvdXQgb2YgYSBnaXZlbiBzZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBfc2VxdWVuY2UgVGhlIHNlcXVlbmNlIHRvIGNhbGN1bGF0ZSB0aGUgbmV3IHNlcXVlbmNlIG91dCBvZlxyXG4gICAgICogQHJldHVybnMgdGhlIHJhc3RlcmVkIHNlcXVlbmNlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVJhc3RlcmVkU2VxdWVuY2UoX3NlcXVlbmNlOiBBbmltYXRpb25TZXF1ZW5jZSk6IEFuaW1hdGlvblNlcXVlbmNlIHtcclxuICAgICAgbGV0IHNlcTogQW5pbWF0aW9uU2VxdWVuY2UgPSBuZXcgQW5pbWF0aW9uU2VxdWVuY2UoKTtcclxuICAgICAgbGV0IGZyYW1lVGltZTogbnVtYmVyID0gMTAwMCAvIHRoaXMuZnJhbWVzUGVyU2Vjb25kO1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy50b3RhbFRpbWU7IGkgKz0gZnJhbWVUaW1lKSB7XHJcbiAgICAgICAgbGV0IGtleTogQW5pbWF0aW9uS2V5ID0gbmV3IEFuaW1hdGlvbktleShpLCBfc2VxdWVuY2UuZXZhbHVhdGUoaSksIDAsIDAsIHRydWUpO1xyXG4gICAgICAgIHNlcS5hZGRLZXkoa2V5KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc2VxO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyByZXZlcnNlZCBbW0FuaW1hdGlvbkV2ZW50VHJpZ2dlcl1dIG9iamVjdCBiYXNlZCBvbiB0aGUgZ2l2ZW4gb25lLiAgXHJcbiAgICAgKiBAcGFyYW0gX2V2ZW50cyB0aGUgZXZlbnQgb2JqZWN0IHRvIGNhbGN1bGF0ZSB0aGUgbmV3IG9uZSBvdXQgb2ZcclxuICAgICAqIEByZXR1cm5zIHRoZSByZXZlcnNlZCBldmVudCBvYmplY3RcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSZXZlcnNlRXZlbnRUcmlnZ2VycyhfZXZlbnRzOiBBbmltYXRpb25FdmVudFRyaWdnZXIpOiBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgICBsZXQgYWU6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9ldmVudHMpIHtcclxuICAgICAgICBhZVtuYW1lXSA9IHRoaXMudG90YWxUaW1lIC0gX2V2ZW50c1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIHJhc3RlcmVkIFtbQW5pbWF0aW9uRXZlbnRUcmlnZ2VyXV0gb2JqZWN0IGJhc2VkIG9uIHRoZSBnaXZlbiBvbmUuICBcclxuICAgICAqIEBwYXJhbSBfZXZlbnRzIHRoZSBldmVudCBvYmplY3QgdG8gY2FsY3VsYXRlIHRoZSBuZXcgb25lIG91dCBvZlxyXG4gICAgICogQHJldHVybnMgdGhlIHJhc3RlcmVkIGV2ZW50IG9iamVjdFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVJhc3RlcmVkRXZlbnRUcmlnZ2VycyhfZXZlbnRzOiBBbmltYXRpb25FdmVudFRyaWdnZXIpOiBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgICBsZXQgYWU6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciA9IHt9O1xyXG4gICAgICBsZXQgZnJhbWVUaW1lOiBudW1iZXIgPSAxMDAwIC8gdGhpcy5mcmFtZXNQZXJTZWNvbmQ7XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX2V2ZW50cykge1xyXG4gICAgICAgIGFlW25hbWVdID0gX2V2ZW50c1tuYW1lXSAtIChfZXZlbnRzW25hbWVdICUgZnJhbWVUaW1lKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoaWNoIGV2ZW50cyBsYXkgYmV0d2VlbiB0d28gZ2l2ZW4gdGltZXMgYW5kIHJldHVybnMgdGhlIG5hbWVzIG9mIHRoZSBvbmVzIHRoYXQgZG8uXHJcbiAgICAgKiBAcGFyYW0gX2V2ZW50VHJpZ2dlcnMgVGhlIGV2ZW50IG9iamVjdCB0byBjaGVjayB0aGUgZXZlbnRzIGluc2lkZSBvZlxyXG4gICAgICogQHBhcmFtIF9taW4gdGhlIG1pbmltdW0gb2YgdGhlIHJhbmdlIHRvIGNoZWNrIGJldHdlZW4gKGluY2x1c2l2ZSlcclxuICAgICAqIEBwYXJhbSBfbWF4IHRoZSBtYXhpbXVtIG9mIHRoZSByYW5nZSB0byBjaGVjayBiZXR3ZWVuIChleGNsdXNpdmUpXHJcbiAgICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgbmFtZXMgb2YgdGhlIGV2ZW50cyBpbiB0aGUgZ2l2ZW4gcmFuZ2UuIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoZWNrRXZlbnRzQmV0d2VlbihfZXZlbnRUcmlnZ2VyczogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyLCBfbWluOiBudW1iZXIsIF9tYXg6IG51bWJlcik6IHN0cmluZ1tdIHtcclxuICAgICAgbGV0IGV2ZW50c1RvVHJpZ2dlcjogc3RyaW5nW10gPSBbXTtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfZXZlbnRUcmlnZ2Vycykge1xyXG4gICAgICAgIGlmIChfbWluIDw9IF9ldmVudFRyaWdnZXJzW25hbWVdICYmIF9ldmVudFRyaWdnZXJzW25hbWVdIDwgX21heCkge1xyXG4gICAgICAgICAgZXZlbnRzVG9UcmlnZ2VyLnB1c2gobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBldmVudHNUb1RyaWdnZXI7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlcyB0aGUgdmFsdWVzIGJldHdlZW4gW1tBbmltYXRpb25LZXldXXMuXHJcbiAgICogUmVwcmVzZW50ZWQgaW50ZXJuYWxseSBieSBhIGN1YmljIGZ1bmN0aW9uIChgZih4KSA9IGF4wrMgKyBieMKyICsgY3ggKyBkYCkuIFxyXG4gICAqIE9ubHkgbmVlZHMgdG8gYmUgcmVjYWxjdWxhdGVkIHdoZW4gdGhlIGtleXMgY2hhbmdlLCBzbyBhdCBydW50aW1lIGl0IHNob3VsZCBvbmx5IGJlIGNhbGN1bGF0ZWQgb25jZS5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkZ1bmN0aW9uIHtcclxuICAgIHByaXZhdGUgYTogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgYjogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgYzogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgZDogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUga2V5SW46IEFuaW1hdGlvbktleTtcclxuICAgIHByaXZhdGUga2V5T3V0OiBBbmltYXRpb25LZXk7XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKF9rZXlJbjogQW5pbWF0aW9uS2V5LCBfa2V5T3V0OiBBbmltYXRpb25LZXkgPSBudWxsKSB7XHJcbiAgICAgIHRoaXMua2V5SW4gPSBfa2V5SW47XHJcbiAgICAgIHRoaXMua2V5T3V0ID0gX2tleU91dDtcclxuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgdGhlIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiBhdCB0aGUgZ2l2ZW4gdGltZS5cclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgcG9pbnQgaW4gdGltZSBhdCB3aGljaCB0byBldmFsdWF0ZSB0aGUgZnVuY3Rpb24gaW4gbWlsbGlzZWNvbmRzLiBXaWxsIGJlIGNvcnJlY3RlZCBmb3Igb2Zmc2V0IGludGVybmFsbHkuXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgdmFsdWUgYXQgdGhlIGdpdmVuIHRpbWVcclxuICAgICAqL1xyXG4gICAgZXZhbHVhdGUoX3RpbWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgIF90aW1lIC09IHRoaXMua2V5SW4uVGltZTtcclxuICAgICAgbGV0IHRpbWUyOiBudW1iZXIgPSBfdGltZSAqIF90aW1lO1xyXG4gICAgICBsZXQgdGltZTM6IG51bWJlciA9IHRpbWUyICogX3RpbWU7XHJcbiAgICAgIHJldHVybiB0aGlzLmEgKiB0aW1lMyArIHRoaXMuYiAqIHRpbWUyICsgdGhpcy5jICogX3RpbWUgKyB0aGlzLmQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHNldEtleUluKF9rZXlJbjogQW5pbWF0aW9uS2V5KSB7XHJcbiAgICAgIHRoaXMua2V5SW4gPSBfa2V5SW47XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHNldEtleU91dChfa2V5T3V0OiBBbmltYXRpb25LZXkpIHtcclxuICAgICAgdGhpcy5rZXlPdXQgPSBfa2V5T3V0O1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogKFJlLSlDYWxjdWxhdGVzIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBjdWJpYyBmdW5jdGlvbi5cclxuICAgICAqIFNlZSBodHRwczovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzMxNzM0NjkvY2FsY3VsYXRlLWN1YmljLWVxdWF0aW9uLWZyb20tdHdvLXBvaW50cy1hbmQtdHdvLXNsb3Blcy12YXJpYWJseVxyXG4gICAgICogYW5kIGh0dHBzOi8vamlya2FkZWxsb3JvLmdpdGh1Yi5pby9GVURHRS9Eb2N1bWVudGF0aW9uL0xvZ3MvMTkwNDEwX05vdGl6ZW5fTFNcclxuICAgICAqL1xyXG4gICAgY2FsY3VsYXRlKCk6IHZvaWQge1xyXG4gICAgICBpZiAoIXRoaXMua2V5SW4pIHtcclxuICAgICAgICB0aGlzLmQgPSB0aGlzLmMgPSB0aGlzLmIgPSB0aGlzLmEgPSAwO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIXRoaXMua2V5T3V0IHx8IHRoaXMua2V5SW4uQ29uc3RhbnQpIHtcclxuICAgICAgICB0aGlzLmQgPSB0aGlzLmtleUluLlZhbHVlO1xyXG4gICAgICAgIHRoaXMuYyA9IHRoaXMuYiA9IHRoaXMuYSA9IDA7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgeDE6IG51bWJlciA9IHRoaXMua2V5T3V0LlRpbWUgLSB0aGlzLmtleUluLlRpbWU7XHJcblxyXG4gICAgICB0aGlzLmQgPSB0aGlzLmtleUluLlZhbHVlO1xyXG4gICAgICB0aGlzLmMgPSB0aGlzLmtleUluLlNsb3BlT3V0O1xyXG5cclxuICAgICAgdGhpcy5hID0gKC14MSAqICh0aGlzLmtleUluLlNsb3BlT3V0ICsgdGhpcy5rZXlPdXQuU2xvcGVJbikgLSAyICogdGhpcy5rZXlJbi5WYWx1ZSArIDIgKiB0aGlzLmtleU91dC5WYWx1ZSkgLyAtTWF0aC5wb3coeDEsIDMpO1xyXG4gICAgICB0aGlzLmIgPSAodGhpcy5rZXlPdXQuU2xvcGVJbiAtIHRoaXMua2V5SW4uU2xvcGVPdXQgLSAzICogdGhpcy5hICogTWF0aC5wb3coeDEsIDIpKSAvICgyICogeDEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvU2VyaWFsaXplci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL011dGFibGUudHNcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCBzZXQgcG9pbnRzIGluIHRpbWUsIHRoZWlyIGFjY29tcGFueWluZyB2YWx1ZXMgYXMgd2VsbCBhcyB0aGVpciBzbG9wZXMuIFxyXG4gICAqIEFsc28gaG9sZHMgYSByZWZlcmVuY2UgdG8gdGhlIFtbQW5pbWF0aW9uRnVuY3Rpb25dXXMgdGhhdCBjb21lIGluIGFuZCBvdXQgb2YgdGhlIHNpZGVzLiBUaGUgW1tBbmltYXRpb25GdW5jdGlvbl1dcyBhcmUgaGFuZGxlZCBieSB0aGUgW1tBbmltYXRpb25TZXF1ZW5jZV1dcy5cclxuICAgKiBTYXZlZCBpbnNpZGUgYW4gW1tBbmltYXRpb25TZXF1ZW5jZV1dLlxyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uS2V5IGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAvLyBUT0RPOiBjaGVjayBpZiBmdW5jdGlvbkluIGNhbiBiZSByZW1vdmVkXHJcbiAgICAvKipEb24ndCBtb2RpZnkgdGhpcyB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UncmUgZG9pbmcuKi9cclxuICAgIGZ1bmN0aW9uSW46IEFuaW1hdGlvbkZ1bmN0aW9uO1xyXG4gICAgLyoqRG9uJ3QgbW9kaWZ5IHRoaXMgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLiovXHJcbiAgICBmdW5jdGlvbk91dDogQW5pbWF0aW9uRnVuY3Rpb247XHJcbiAgICBcclxuICAgIGJyb2tlbjogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIHRpbWU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdmFsdWU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY29uc3RhbnQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIHNsb3BlSW46IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIHNsb3BlT3V0OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKF90aW1lOiBudW1iZXIgPSAwLCBfdmFsdWU6IG51bWJlciA9IDAsIF9zbG9wZUluOiBudW1iZXIgPSAwLCBfc2xvcGVPdXQ6IG51bWJlciA9IDAsIF9jb25zdGFudDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMudGltZSA9IF90aW1lO1xyXG4gICAgICB0aGlzLnZhbHVlID0gX3ZhbHVlO1xyXG4gICAgICB0aGlzLnNsb3BlSW4gPSBfc2xvcGVJbjtcclxuICAgICAgdGhpcy5zbG9wZU91dCA9IF9zbG9wZU91dDtcclxuICAgICAgdGhpcy5jb25zdGFudCA9IF9jb25zdGFudDtcclxuXHJcbiAgICAgIHRoaXMuYnJva2VuID0gdGhpcy5zbG9wZUluICE9IC10aGlzLnNsb3BlT3V0O1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uT3V0ID0gbmV3IEFuaW1hdGlvbkZ1bmN0aW9uKHRoaXMsIG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IFRpbWUoX3RpbWU6IG51bWJlcikge1xyXG4gICAgICB0aGlzLnRpbWUgPSBfdGltZTtcclxuICAgICAgdGhpcy5mdW5jdGlvbkluLmNhbGN1bGF0ZSgpO1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uT3V0LmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBWYWx1ZSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgVmFsdWUoX3ZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy52YWx1ZSA9IF92YWx1ZTtcclxuICAgICAgdGhpcy5mdW5jdGlvbkluLmNhbGN1bGF0ZSgpO1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uT3V0LmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgQ29uc3RhbnQoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBDb25zdGFudChfY29uc3RhbnQ6IGJvb2xlYW4pIHtcclxuICAgICAgdGhpcy5jb25zdGFudCA9IF9jb25zdGFudDtcclxuICAgICAgdGhpcy5mdW5jdGlvbkluLmNhbGN1bGF0ZSgpO1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uT3V0LmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBTbG9wZUluKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNsb3BlSW47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldCBTbG9wZUluKF9zbG9wZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuc2xvcGVJbiA9IF9zbG9wZTtcclxuICAgICAgdGhpcy5mdW5jdGlvbkluLmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBTbG9wZU91dCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5zbG9wZU91dDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgU2xvcGVPdXQoX3Nsb3BlOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5zbG9wZU91dCA9IF9zbG9wZTtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dC5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXRpYyBjb21wYXJhdGlvbiBmdW5jdGlvbiB0byB1c2UgaW4gYW4gYXJyYXkgc29ydCBmdW5jdGlvbiB0byBzb3J0IHRoZSBrZXlzIGJ5IHRoZWlyIHRpbWUuXHJcbiAgICAgKiBAcGFyYW0gX2EgdGhlIGFuaW1hdGlvbiBrZXkgdG8gY2hlY2tcclxuICAgICAqIEBwYXJhbSBfYiB0aGUgYW5pbWF0aW9uIGtleSB0byBjaGVjayBhZ2FpbnN0XHJcbiAgICAgKiBAcmV0dXJucyA+MCBpZiBhPmIsIDAgaWYgYT1iLCA8MCBpZiBhPGJcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNvbXBhcmUoX2E6IEFuaW1hdGlvbktleSwgX2I6IEFuaW1hdGlvbktleSk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiBfYS50aW1lIC0gX2IudGltZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyNyZWdpb24gdHJhbnNmZXJcclxuICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IHM6IFNlcmlhbGl6YXRpb24gPSB7fTtcclxuICAgICAgcy50aW1lID0gdGhpcy50aW1lO1xyXG4gICAgICBzLnZhbHVlID0gdGhpcy52YWx1ZTtcclxuICAgICAgcy5zbG9wZUluID0gdGhpcy5zbG9wZUluO1xyXG4gICAgICBzLnNsb3BlT3V0ID0gdGhpcy5zbG9wZU91dDtcclxuICAgICAgcy5jb25zdGFudCA9IHRoaXMuY29uc3RhbnQ7XHJcbiAgICAgIHJldHVybiBzO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgdGhpcy50aW1lID0gX3NlcmlhbGl6YXRpb24udGltZTtcclxuICAgICAgdGhpcy52YWx1ZSA9IF9zZXJpYWxpemF0aW9uLnZhbHVlO1xyXG4gICAgICB0aGlzLnNsb3BlSW4gPSBfc2VyaWFsaXphdGlvbi5zbG9wZUluO1xyXG4gICAgICB0aGlzLnNsb3BlT3V0ID0gX3NlcmlhbGl6YXRpb24uc2xvcGVPdXQ7XHJcbiAgICAgIHRoaXMuY29uc3RhbnQgPSBfc2VyaWFsaXphdGlvbi5jb25zdGFudDtcclxuXHJcbiAgICAgIHRoaXMuYnJva2VuID0gdGhpcy5zbG9wZUluICE9IC10aGlzLnNsb3BlT3V0O1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2VyaWFsaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgLy9cclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICB9XHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogQSBzZXF1ZW5jZSBvZiBbW0FuaW1hdGlvbktleV1dcyB0aGF0IGlzIG1hcHBlZCB0byBhbiBhdHRyaWJ1dGUgb2YgYSBbW05vZGVdXSBvciBpdHMgW1tDb21wb25lbnRdXXMgaW5zaWRlIHRoZSBbW0FuaW1hdGlvbl1dLlxyXG4gICAqIFByb3ZpZGVzIGZ1bmN0aW9ucyB0byBtb2RpZnkgc2FpZCBrZXlzXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBBbmltYXRpb25TZXF1ZW5jZSBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgcHJpdmF0ZSBrZXlzOiBBbmltYXRpb25LZXlbXSA9IFtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXZhbHVhdGVzIHRoZSBzZXF1ZW5jZSBhdCB0aGUgZ2l2ZW4gcG9pbnQgaW4gdGltZS5cclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgcG9pbnQgaW4gdGltZSBhdCB3aGljaCB0byBldmFsdWF0ZSB0aGUgc2VxdWVuY2UgaW4gbWlsbGlzZWNvbmRzLlxyXG4gICAgICogQHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBzZXF1ZW5jZSBhdCB0aGUgZ2l2ZW4gdGltZS4gMCBpZiB0aGVyZSBhcmUgbm8ga2V5cy5cclxuICAgICAqL1xyXG4gICAgZXZhbHVhdGUoX3RpbWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgIGlmICh0aGlzLmtleXMubGVuZ3RoID09IDApXHJcbiAgICAgICAgcmV0dXJuIDA7IC8vVE9ETzogc2hvdWxkbid0IHJldHVybiAwIGJ1dCBzb21ldGhpbmcgaW5kaWNhdGluZyBubyBjaGFuZ2UsIGxpa2UgbnVsbC4gcHJvYmFibHkgbmVlZHMgdG8gYmUgY2hhbmdlZCBpbiBOb2RlIGFzIHdlbGwgdG8gaWdub3JlIG5vbi1udW1lcmljIHZhbHVlcyBpbiB0aGUgYXBwbHlBbmltYXRpb24gZnVuY3Rpb25cclxuICAgICAgaWYgKHRoaXMua2V5cy5sZW5ndGggPT0gMSB8fCB0aGlzLmtleXNbMF0uVGltZSA+PSBfdGltZSlcclxuICAgICAgICByZXR1cm4gdGhpcy5rZXlzWzBdLlZhbHVlO1xyXG5cclxuXHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMua2V5c1tpXS5UaW1lIDw9IF90aW1lICYmIHRoaXMua2V5c1tpICsgMV0uVGltZSA+IF90aW1lKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5rZXlzW2ldLmZ1bmN0aW9uT3V0LmV2YWx1YXRlKF90aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMua2V5c1t0aGlzLmtleXMubGVuZ3RoIC0gMV0uVmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbmV3IGtleSB0byB0aGUgc2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gX2tleSB0aGUga2V5IHRvIGFkZFxyXG4gICAgICovXHJcbiAgICBhZGRLZXkoX2tleTogQW5pbWF0aW9uS2V5KTogdm9pZCB7XHJcbiAgICAgIHRoaXMua2V5cy5wdXNoKF9rZXkpO1xyXG4gICAgICB0aGlzLmtleXMuc29ydChBbmltYXRpb25LZXkuY29tcGFyZSk7XHJcbiAgICAgIHRoaXMucmVnZW5lcmF0ZUZ1bmN0aW9ucygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhIGdpdmVuIGtleSBmcm9tIHRoZSBzZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBfa2V5IHRoZSBrZXkgdG8gcmVtb3ZlXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUtleShfa2V5OiBBbmltYXRpb25LZXkpOiB2b2lkIHtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMua2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLmtleXNbaV0gPT0gX2tleSkge1xyXG4gICAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIHRoaXMucmVnZW5lcmF0ZUZ1bmN0aW9ucygpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgQW5pbWF0aW9uIEtleSBhdCB0aGUgZ2l2ZW4gaW5kZXggZnJvbSB0aGUga2V5cy5cclxuICAgICAqIEBwYXJhbSBfaW5kZXggdGhlIHplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gcmVtb3ZlIHRoZSBrZXlcclxuICAgICAqIEByZXR1cm5zIHRoZSByZW1vdmVkIEFuaW1hdGlvbktleSBpZiBzdWNjZXNzZnVsLCBudWxsIG90aGVyd2lzZS5cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlS2V5QXRJbmRleChfaW5kZXg6IG51bWJlcik6IEFuaW1hdGlvbktleSB7XHJcbiAgICAgIGlmIChfaW5kZXggPCAwIHx8IF9pbmRleCA+PSB0aGlzLmtleXMubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGFrOiBBbmltYXRpb25LZXkgPSB0aGlzLmtleXNbX2luZGV4XTtcclxuICAgICAgdGhpcy5rZXlzLnNwbGljZShfaW5kZXgsIDEpO1xyXG4gICAgICB0aGlzLnJlZ2VuZXJhdGVGdW5jdGlvbnMoKTtcclxuICAgICAgcmV0dXJuIGFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBhIGtleSBmcm9tIHRoZSBzZXF1ZW5jZSBhdCB0aGUgZGVzaXJlZCBpbmRleC5cclxuICAgICAqIEBwYXJhbSBfaW5kZXggdGhlIHplcm8tYmFzZWQgaW5kZXggYXQgd2hpY2ggdG8gZ2V0IHRoZSBrZXlcclxuICAgICAqIEByZXR1cm5zIHRoZSBBbmltYXRpb25LZXkgYXQgdGhlIGluZGV4IGlmIGl0IGV4aXN0cywgbnVsbCBvdGhlcndpc2UuXHJcbiAgICAgKi9cclxuICAgIGdldEtleShfaW5kZXg6IG51bWJlcik6IEFuaW1hdGlvbktleSB7XHJcbiAgICAgIGlmIChfaW5kZXggPCAwIHx8IF9pbmRleCA+PSB0aGlzLmtleXMubGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICByZXR1cm4gdGhpcy5rZXlzW19pbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5rZXlzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyNyZWdpb24gdHJhbnNmZXJcclxuICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IHM6IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAga2V5czogW10sXHJcbiAgICAgICAgYW5pbWF0aW9uU2VxdWVuY2U6IHRydWVcclxuICAgICAgfTtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMua2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHMua2V5c1tpXSA9IHRoaXMua2V5c1tpXS5zZXJpYWxpemUoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcztcclxuICAgIH1cclxuICAgIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IF9zZXJpYWxpemF0aW9uLmtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyB0aGlzLmtleXMucHVzaCg8QW5pbWF0aW9uS2V5PlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ua2V5c1tpXSkpO1xyXG4gICAgICAgIGxldCBrOiBBbmltYXRpb25LZXkgPSBuZXcgQW5pbWF0aW9uS2V5KCk7XHJcbiAgICAgICAgay5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5rZXlzW2ldKTtcclxuICAgICAgICB0aGlzLmtleXNbaV0gPSBrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnJlZ2VuZXJhdGVGdW5jdGlvbnMoKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAvL1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVdGlsaXR5IGZ1bmN0aW9uIHRoYXQgKHJlLSlnZW5lcmF0ZXMgYWxsIGZ1bmN0aW9ucyBpbiB0aGUgc2VxdWVuY2UuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVnZW5lcmF0ZUZ1bmN0aW9ucygpOiB2b2lkIHtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMua2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBmOiBBbmltYXRpb25GdW5jdGlvbiA9IG5ldyBBbmltYXRpb25GdW5jdGlvbih0aGlzLmtleXNbaV0pO1xyXG4gICAgICAgIHRoaXMua2V5c1tpXS5mdW5jdGlvbk91dCA9IGY7XHJcbiAgICAgICAgaWYgKGkgPT0gdGhpcy5rZXlzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgIC8vVE9ETzogY2hlY2sgaWYgdGhpcyBpcyBldmVuIHVzZWZ1bC4gTWF5YmUgdXBkYXRlIHRoZSBydW5jb25kaXRpb24gdG8gbGVuZ3RoIC0gMSBpbnN0ZWFkLiBNaWdodCBiZSByZWR1bmRhbnQgaWYgZnVuY3Rpb25JbiBpcyByZW1vdmVkLCBzZWUgVE9ETyBpbiBBbmltYXRpb25LZXkuXHJcbiAgICAgICAgICBmLnNldEtleU91dCA9IHRoaXMua2V5c1swXTtcclxuICAgICAgICAgIHRoaXMua2V5c1swXS5mdW5jdGlvbkluID0gZjtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmLnNldEtleU91dCA9IHRoaXMua2V5c1tpICsgMV07XHJcbiAgICAgICAgdGhpcy5rZXlzW2kgKyAxXS5mdW5jdGlvbkluID0gZjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXNjcmliZXMgdGhlIFtbQXVkaW9dXSBjbGFzcyBpbiB3aGljaCBhbGwgQXVkaW8gRGF0YSBpcyBzdG9yZWQuXHJcbiAgICAgKiBBdWRpbyB3aWxsIGJlIGdpdmVuIHRvIHRoZSBbW0NvbXBvbmVudEF1ZGlvXV0gZm9yIGZ1cnRoZXIgdXNhZ2UuXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvIHtcclxuXHJcbiAgICAgICAgcHVibGljIHVybDogc3RyaW5nO1xyXG5cclxuICAgICAgICBwdWJsaWMgYXVkaW9CdWZmZXI6IEF1ZGlvQnVmZmVyO1xyXG4gICAgICAgIHB1YmxpYyBidWZmZXJTb3VyY2U6IEF1ZGlvQnVmZmVyU291cmNlTm9kZTtcclxuXHJcbiAgICAgICAgcHVibGljIGxvY2FsR2FpbjogR2Fpbk5vZGU7XHJcbiAgICAgICAgcHVibGljIGxvY2FsR2FpblZhbHVlOiBudW1iZXI7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpc0xvb3Bpbmc6IGJvb2xlYW47XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnN0cnVjdG9yIGZvciB0aGUgW1tBdWRpb11dIENsYXNzXHJcbiAgICAgICAgICogQHBhcmFtIF9hdWRpb0NvbnRleHQgZnJvbSBbW0F1ZGlvU2V0dGluZ3NdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfZ2FpblZhbHVlIDAgZm9yIG11dGVkIHwgMSBmb3IgbWF4IHZvbHVtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCwgX2F1ZGlvU2Vzc2lvbkRhdGE6IEF1ZGlvU2Vzc2lvbkRhdGEsIF91cmw6IHN0cmluZywgX2dhaW5WYWx1ZTogbnVtYmVyLCBfbG9vcDogYm9vbGVhbikge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoX2F1ZGlvQ29udGV4dCwgX2F1ZGlvU2Vzc2lvbkRhdGEsIF91cmwsIF9nYWluVmFsdWUsIF9sb29wKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBhc3luYyBpbml0KF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCwgX2F1ZGlvU2Vzc2lvbkRhdGE6IEF1ZGlvU2Vzc2lvbkRhdGEsIF91cmw6IHN0cmluZywgX2dhaW5WYWx1ZTogbnVtYmVyLCBfbG9vcDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICAvLyBEbyBldmVyeXRoaW5nIGluIGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgIC8vIEFkZCB1cmwgdG8gQXVkaW9cclxuICAgICAgICAgICAgdGhpcy51cmwgPSBfdXJsO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1ZGlvIHVybCBcIiArIHRoaXMudXJsKTtcclxuICAgICAgICAgICAgLy8gR2V0IEF1ZGlvQnVmZmVyXHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlclByb206IFByb21pc2U8QXVkaW9CdWZmZXI+ID0gX2F1ZGlvU2Vzc2lvbkRhdGEudXJsVG9CdWZmZXIoX2F1ZGlvQ29udGV4dCwgX3VybCk7XHJcbiAgICAgICAgICAgIHdoaWxlICghYnVmZmVyUHJvbSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ3YWl0aW5nLi4uXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IGJ1ZmZlclByb20udGhlbih2YWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb0J1ZmZlciA9IHZhbDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidmFsQnVmZmVyIFwiICsgdmFsKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXVkaW8gYXVkaW9idWZmZXIgXCIgKyB0aGlzLmF1ZGlvQnVmZmVyKTtcclxuICAgICAgICAgICAgLy8gLy8gQWRkIGxvY2FsIEdhaW4gZm9yIEF1ZGlvICBhbmQgY29ubmVjdCBcclxuICAgICAgICAgICAgdGhpcy5sb2NhbEdhaW4gPSBhd2FpdCBfYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbEdhaW5WYWx1ZSA9IGF3YWl0IF9nYWluVmFsdWU7XHJcbiAgICAgICAgICAgIC8vY3JlYXRlIEF1ZGlvXHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQXVkaW8oX2F1ZGlvQ29udGV4dCwgdGhpcy5hdWRpb0J1ZmZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBpbml0QnVmZmVyU291cmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGluaXRCdWZmZXJTb3VyY2UoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyU291cmNlID0gX2F1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuYnVmZmVyID0gdGhpcy5hdWRpb0J1ZmZlcjtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJiUyA9IFwiICsgdGhpcy5idWZmZXJTb3VyY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5jb25uZWN0KF9hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRMb29wKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkTG9jYWxHYWluKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQnVmZmVyU291cmNlLmJ1ZmZlcjogXCIgKyB0aGlzLmJ1ZmZlclNvdXJjZS5idWZmZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1ZGlvQnVmZmVyOiBcIiArIHRoaXMuYXVkaW9CdWZmZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIEdldHRlci9TZXR0ZXIgTG9jYWxHYWluVmFsdWVcclxuICAgICAgICBwdWJsaWMgc2V0TG9jYWxHYWluVmFsdWUoX2xvY2FsR2FpblZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbEdhaW5WYWx1ZSA9IF9sb2NhbEdhaW5WYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRMb2NhbEdhaW5WYWx1ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbEdhaW5WYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uIEdldHRlci9TZXR0ZXIgTG9jYWxHYWluVmFsdWVcclxuXHJcbiAgICAgICAgcHVibGljIHNldEJ1ZmZlclNvdXJjZShfYnVmZmVyOiBBdWRpb0J1ZmZlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSBfYnVmZmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY3JlYXRlQXVkaW8gYnVpbGRzIGFuIFtbQXVkaW9dXSB0byB1c2Ugd2l0aCB0aGUgW1tDb21wb25lbnRBdWRpb11dXHJcbiAgICAgICAgICogQHBhcmFtIF9hdWRpb0NvbnRleHQgZnJvbSBbW0F1ZGlvU2V0dGluZ3NdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW9CdWZmZXIgZnJvbSBbW0F1ZGlvU2Vzc2lvbkRhdGFdXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgY3JlYXRlQXVkaW8oX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0LCBfYXVkaW9CdWZmZXI6IEF1ZGlvQnVmZmVyKTogQXVkaW9CdWZmZXIge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZUF1ZGlvKCkgXCIgKyBcIiB8IFwiICsgXCIgQXVkaW9Db250ZXh0OiBcIiArIF9hdWRpb0NvbnRleHQpO1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvQnVmZmVyID0gX2F1ZGlvQnVmZmVyO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFCID0gXCIgKyB0aGlzLmF1ZGlvQnVmZmVyKTtcclxuICAgICAgICAgICAgLy8gQXVkaW9CdWZmZXJzb3VyY2VOb2RlIFNldHVwXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEJ1ZmZlclNvdXJjZShfYXVkaW9Db250ZXh0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW9CdWZmZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHNldExvb3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmxvb3AgPSB0aGlzLmlzTG9vcGluZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYWRkTG9jYWxHYWluKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMubG9jYWxHYWluKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGFuIFtbQXVkaW9GaWx0ZXJdXSB0byBhbiBbW0F1ZGlvXV1cclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBlbnVtIEZJTFRFUl9UWVBFIHtcclxuICAgICAgICBMT1dQQVNTID0gXCJMT1dQQVNTXCIsXHJcbiAgICAgICAgSElHSFBBU1MgPSBcIkhJR0hQQVNTXCIsXHJcbiAgICAgICAgQkFORFBBU1MgPSBcIkJBTkRQQVNTXCIsXHJcbiAgICAgICAgTE9XU0hFTEYgPSBcIkxPV1NIRUxGXCIsXHJcbiAgICAgICAgSElHSFNIRUxGID0gXCJISUdIU0hFTEZcIixcclxuICAgICAgICBQRUFLSU5HID0gXCJQRUFLSU5HXCIsXHJcbiAgICAgICAgTk9UQ0ggPSBcIk5PVENIXCIsXHJcbiAgICAgICAgQUxMUEFTUyA9IFwiQUxMUEFTU1wiXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvRmlsdGVyIHtcclxuXHJcbiAgICAgICAgcHVibGljIHVzZUZpbHRlcjogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgZmlsdGVyVHlwZTogRklMVEVSX1RZUEU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3RydWN0b3IoX3VzZUZpbHRlcjogYm9vbGVhbiwgX2ZpbHRlclR5cGU6IEZJTFRFUl9UWVBFKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlRmlsdGVyID0gX3VzZUZpbHRlcjtcclxuICAgICAgICAgICAgdGhpcy5maWx0ZXJUeXBlID0gX2ZpbHRlclR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhZGRGaWx0ZXJUb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhZGRGaWx0ZXJUb0F1ZGlvKF9hdWRpb0J1ZmZlcjogQXVkaW9CdWZmZXIsIF9maWx0ZXJUeXBlOiBGSUxURVJfVFlQRSk6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRvIG5vdGhpbmcgZm9yIG5vd1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIERlc2NyaWJlcyBhIFtbQXVkaW9MaXN0ZW5lcl1dIGF0dGFjaGVkIHRvIGEgW1tOb2RlXV1cclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQXVkaW9MaXN0ZW5lciB7XHJcbiAgICAgICAgcHVibGljIGF1ZGlvTGlzdGVuZXI6IEF1ZGlvTGlzdGVuZXI7XHJcblxyXG4gICAgICAgIHByaXZhdGUgcG9zaXRpb246IFZlY3RvcjM7XHJcbiAgICAgICAgcHJpdmF0ZSBvcmllbnRhdGlvbjogVmVjdG9yMztcclxuXHJcbiAgICAgICAgLy8jI1RPRE8gQXVkaW9MaXN0ZW5lclxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCkge1xyXG4gICAgICAgICAgICAvL3RoaXMuYXVkaW9MaXN0ZW5lciA9IF9hdWRpb0NvbnRleHQubGlzdGVuZXI7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogV2Ugd2lsbCBjYWxsIHNldEF1ZGlvTGlzdGVuZXJQb3NpdGlvbiB3aGVuZXZlciB0aGVyZSBpcyBhIG5lZWQgdG8gY2hhbmdlIFBvc2l0aW9ucy5cclxuICAgICAgICAgKiBBbGwgdGhlIHBvc2l0aW9uIHZhbHVlcyBzaG91bGQgYmUgaWRlbnRpY2FsIHRvIHRoZSBjdXJyZW50IFBvc2l0aW9uIHRoaXMgaXMgYXR0ZWNoZWQgdG8uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gcHVibGljIHNldEF1ZGlvTGlzdGVuZXJQb3NpdGlvbihfcG9zaXRpb246IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLnBvc2l0aW9uWC52YWx1ZSA9IF9wb3NpdGlvbi54O1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIucG9zaXRpb25ZLnZhbHVlID0gX3Bvc2l0aW9uLnk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5wb3NpdGlvbloudmFsdWUgPSBfcG9zaXRpb24uejtcclxuXHJcbiAgICAgICAgLy8gICAgIHRoaXMucG9zaXRpb24gPSBfcG9zaXRpb247XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnZXRBdWRpb0xpc3RlbmVyUG9zaXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0QXVkaW9MaXN0ZW5lclBvc2l0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNldEF1ZGlvTGlzdGVuZXJPcmllbnRhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzZXRBdWRpb0xpc3RlbmVyT3JpZW50YXRpb24oX29yaWVudGF0aW9uOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5vcmllbnRhdGlvblgudmFsdWUgPSBfb3JpZW50YXRpb24ueDtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLm9yaWVudGF0aW9uWS52YWx1ZSA9IF9vcmllbnRhdGlvbi55O1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIub3JpZW50YXRpb25aLnZhbHVlID0gX29yaWVudGF0aW9uLno7XHJcblxyXG4gICAgICAgIC8vICAgICB0aGlzLm9yaWVudGF0aW9uID0gX29yaWVudGF0aW9uO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0QXVkaW9MaXN0ZW5lck9yaWVudGF0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEF1ZGlvTGlzdGVuZXJPcmllbnRhdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVc2UgUG9zaXRpb24gZnJvbSBQYXJlbnQgTm9kZSB0byB1cGRhdGUgb3duIFBvc2l0aW9uIGFjY29yZGluZ2x5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gcHJpdmF0ZSBnZXRQYXJlbnROb2RlUG9zaXRpb24oKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIC8vIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBcclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBlbnVtIFBBTk5JTkdfTU9ERUxfVFlQRSB7XHJcbiAgICAgICAgRVFVQUxQT1dFUiA9IFwiRVFVQUxQT1dFUlwiLFxyXG4gICAgICAgIEhSRlQgPSBcIkhSRlRcIlxyXG4gICAgfVxyXG5cclxuICAgIGVudW0gRElTVEFOQ0VfTU9ERUxfVFlQRSB7XHJcbiAgICAgICAgTElORUFSID0gXCJMSU5FQVJcIixcclxuICAgICAgICBJTlZFUlNFID0gXCJJTlZFUlNFXCIsXHJcbiAgICAgICAgRVhQT05FTlRJQUwgPSBcIkVYUE9ORU5USUFMXCJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQXVkaW9Mb2NhbGlzYXRpb24ge1xyXG5cclxuICAgICAgICBwdWJsaWMgcGFubmVyTm9kZTogUGFubmVyTm9kZTtcclxuICAgICAgICBwdWJsaWMgcGFubmluZ01vZGVsOiBQQU5OSU5HX01PREVMX1RZUEU7XHJcbiAgICAgICAgcHVibGljIGRpc3RhbmNlTW9kZWw6IERJU1RBTkNFX01PREVMX1RZUEU7XHJcbiAgICAgICAgcHVibGljIHJlZkRpc3RhbmNlOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIG1heERpc3RhbmNlOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHJvbGxvZmZGYWN0b3I6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY29ubmVySW5uZXJBbmdsZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjb25lT3V0ZXJBbmdsZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjb25lT3V0ZXJHYWluOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHBvc2l0aW9uOiBWZWN0b3IzO1xyXG4gICAgICAgIHB1YmxpYyBvcmllbnRhdGlvbjogVmVjdG9yMztcclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb25zdHJ1Y3RvciBmb3IgdGhlIFtbQXVkaW9Mb2NhbGlzYXRpb25dXSBDbGFzc1xyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW9Db250ZXh0IGZyb20gW1tBdWRpb1NldHRpbmdzXV1cclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpIHtcclxuICAgICAgICAgICB0aGlzLnBhbm5lck5vZGUgPSBfYXVkaW9Db250ZXh0LmNyZWF0ZVBhbm5lcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8qKlxyXG4gICAgICAgICAqIFdlIHdpbGwgY2FsbCBzZXRQYW5uZXJQb3NpdGlvbiB3aGVuZXZlciB0aGVyZSBpcyBhIG5lZWQgdG8gY2hhbmdlIFBvc2l0aW9ucy5cclxuICAgICAgICAgKiBBbGwgdGhlIHBvc2l0aW9uIHZhbHVlcyBzaG91bGQgYmUgaWRlbnRpY2FsIHRvIHRoZSBjdXJyZW50IFBvc2l0aW9uIHRoaXMgaXMgYXR0ZWNoZWQgdG8uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gcHVibGljIHNldFBhbm5lUG9zaXRpb24oX3Bvc2l0aW9uOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5wb3NpdGlvblgudmFsdWUgPSBfcG9zaXRpb24ueDtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLnBvc2l0aW9uWS52YWx1ZSA9IF9wb3NpdGlvbi55O1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUucG9zaXRpb25aLnZhbHVlID0gX3Bvc2l0aW9uLno7XHJcblxyXG4gICAgICAgIC8vICAgICB0aGlzLnBvc2l0aW9uID0gX3Bvc2l0aW9uO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0UGFubmVyUG9zaXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0UGFubmVyUG9zaXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogc2V0UGFubmVPcmllbnRhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzZXRQYW5uZXJPcmllbnRhdGlvbihfb3JpZW50YXRpb246IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLm9yaWVudGF0aW9uWC52YWx1ZSA9IF9vcmllbnRhdGlvbi54O1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUub3JpZW50YXRpb25ZLnZhbHVlID0gX29yaWVudGF0aW9uLnk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5vcmllbnRhdGlvbloudmFsdWUgPSBfb3JpZW50YXRpb24uejtcclxuXHJcbiAgICAgICAgLy8gICAgIHRoaXMub3JpZW50YXRpb24gPSBfb3JpZW50YXRpb247XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnZXRQYW5uZU9yaWVudGF0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldFBhbm5lT3JpZW50YXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJmYWNlIHRvIGdlbmVyYXRlIERhdGEgUGFpcnMgb2YgVVJMIGFuZCBBdWRpb0J1ZmZlclxyXG4gICAgICovXHJcbiAgICBpbnRlcmZhY2UgQXVkaW9EYXRhIHtcclxuICAgICAgICB1cmw6IHN0cmluZztcclxuICAgICAgICBidWZmZXI6IEF1ZGlvQnVmZmVyO1xyXG4gICAgICAgIGNvdW50ZXI6IG51bWJlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlc2NyaWJlcyBEYXRhIEhhbmRsZXIgZm9yIGFsbCBBdWRpbyBTb3VyY2VzXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvU2Vzc2lvbkRhdGEge1xyXG4gICAgICAgIHB1YmxpYyBkYXRhQXJyYXk6IEF1ZGlvRGF0YVtdO1xyXG4gICAgICAgIHByaXZhdGUgYnVmZmVyQ291bnRlcjogbnVtYmVyO1xyXG4gICAgICAgIC8vVE9ETyBvYnNvbGV0ZSBob2xkZXIgd2hlbiBhcnJheSB3b3JraW5nIC8gbWF5YmUgdXNlIGFzIGhlbHBlciB2YXJcclxuICAgICAgICBwcml2YXRlIGF1ZGlvQnVmZmVySG9sZGVyOiBBdWRpb0RhdGE7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNvbnN0cnVjdG9yIG9mIHRoZSBbW0F1ZGlvU2Vzc2lvbkRhdGFdXSBjbGFzc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFBcnJheSA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlckNvdW50ZXIgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0QnVmZmVyQ291bnRlciByZXR1cm5zIFtidWZmZXJDb3VudGVyXSB0byBrZWVwIHRyYWNrIG9mIG51bWJlciBvZiBkaWZmZXJlbnQgdXNlZCBzb3VuZHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0QnVmZmVyQ291bnRlcigpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJDb3VudGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVjb2RpbmcgQXVkaW8gRGF0YSBcclxuICAgICAgICAgKiBBc3luY2hyb25vdXMgRnVuY3Rpb24gdG8gcGVybWl0IHRoZSBsb2FkaW5nIG9mIG11bHRpcGxlIERhdGEgU291cmNlcyBhdCB0aGUgc2FtZSB0aW1lXHJcbiAgICAgICAgICogQHBhcmFtIF91cmwgVVJMIGFzIFN0cmluZyBmb3IgRGF0YSBmZXRjaGluZ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhc3luYyB1cmxUb0J1ZmZlcihfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQsIF91cmw6IHN0cmluZyk6IFByb21pc2U8QXVkaW9CdWZmZXI+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJpbnNpZGUgdXJsVG9CdWZmZXJcIik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgaW5pdE9iamVjdDogUmVxdWVzdEluaXQgPSB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICBtb2RlOiBcInNhbWUtb3JpZ2luXCIsIC8vZGVmYXVsdCAtPiBzYW1lLW9yaWdpblxyXG4gICAgICAgICAgICAgICAgY2FjaGU6IFwibm8tY2FjaGVcIiwgLy9kZWZhdWx0IC0+IGRlZmF1bHQgXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhdWRpby9tcGVnM1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcmVkaXJlY3Q6IFwiZm9sbG93XCIgLy8gZGVmYXVsdCAtPiBmb2xsb3dcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGV4aXN0aW5nIFVSTCBpbiBEYXRhQXJyYXksIGlmIG5vIGRhdGEgaW5zaWRlIGFkZCBuZXcgQXVkaW9EYXRhXHJcbiAgICAgICAgICAgIC8vdGhpcy5wdXNoRGF0YUFycmF5KF91cmwsIG51bGwpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImxlbmd0aFwiICsgdGhpcy5kYXRhQXJyYXkubGVuZ3RoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YUFycmF5Lmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgd2luZG93IHRvIGZldGNoP1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlOiBSZXNwb25zZSA9IGF3YWl0IHdpbmRvdy5mZXRjaChfdXJsLCBpbml0T2JqZWN0KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcnJheUJ1ZmZlcjogQXJyYXlCdWZmZXIgPSBhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlY29kZWRBdWRpbzogQXVkaW9CdWZmZXIgPSBhd2FpdCBfYXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YShhcnJheUJ1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXNoRGF0YUFycmF5KF91cmwsIGRlY29kZWRBdWRpbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLmRhdGFBcnJheVt0aGlzLmRhdGFBcnJheS5sZW5ndGhdLmJ1ZmZlciA9IGRlY29kZWRBdWRpbztcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImxlbmd0aCBcIiArIHRoaXMuZGF0YUFycmF5Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZWRBdWRpbztcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ0Vycm9yRmV0Y2goZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiBuZWVkZWQgVVJMIGlzIGluc2lkZSBBcnJheSwgXHJcbiAgICAgICAgICAgICAgICAvLyBpdGVyYXRlIHRocm91Z2ggYWxsIGV4aXN0aW5nIERhdGEgdG8gZ2V0IG5lZWRlZCB2YWx1ZXNcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHg6IG51bWJlciA9IDA7IHggPCB0aGlzLmRhdGFBcnJheS5sZW5ndGg7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwid2hhdCBpcyBoYXBwZW5pbmdcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YUFycmF5W3hdLnVybCA9PSBfdXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm91bmQgZXhpc3RpbmcgdXJsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhQXJyYXlbeF0uYnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHB1c2hUdXBsZSBTb3VyY2UgYW5kIERlY29kZWQgQXVkaW8gRGF0YSBnZXRzIHNhdmVkIGZvciBsYXRlciB1c2VcclxuICAgICAgICAgKiBAcGFyYW0gX3VybCBVUkwgZnJvbSB1c2VkIERhdGFcclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvQnVmZmVyIEF1ZGlvQnVmZmVyIGdlbmVyYXRlZCBmcm9tIFVSTFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwdXNoRGF0YUFycmF5KF91cmw6IHN0cmluZywgX2F1ZGlvQnVmZmVyOiBBdWRpb0J1ZmZlcik6IEF1ZGlvRGF0YSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhOiBBdWRpb0RhdGE7XHJcbiAgICAgICAgICAgIGRhdGEgPSB7IHVybDogX3VybCwgYnVmZmVyOiBfYXVkaW9CdWZmZXIsIGNvdW50ZXI6IHRoaXMuYnVmZmVyQ291bnRlciB9O1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFBcnJheS5wdXNoKGRhdGEpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFycmF5OiBcIiArIHRoaXMuZGF0YUFycmF5KTtcclxuXHJcbiAgICAgICAgICAgIC8vVE9ETyBhdWRpb0J1ZmZlckhvbGRlciBvYnNvbGV0ZSBpZiBhcnJheSB3b3JraW5nXHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXVkaW9CdWZmZXJIb2xkZXIoZGF0YSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGF0YVBhaXIgXCIgKyBkYXRhLnVybCArIFwiIFwiICsgZGF0YS5idWZmZXIgKyBcIiBcIiArIGRhdGEuY291bnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyQ291bnRlciArPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdWRpb0J1ZmZlckhvbGRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGl0ZXJhdGVBcnJheVxyXG4gICAgICAgICAqIExvb2sgYXQgc2F2ZWQgRGF0YSBDb3VudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjb3VudERhdGFJbkFycmF5KCk6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRhdGFBcnJheSBMZW5ndGg6IFwiICsgdGhpcy5kYXRhQXJyYXkubGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNob3dEYXRhSW5BcnJheVxyXG4gICAgICAgICAqIFNob3cgYWxsIERhdGEgaW4gQXJyYXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2hvd0RhdGFJbkFycmF5KCk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB4OiBudW1iZXIgPSAwOyB4IDwgdGhpcy5kYXRhQXJyYXkubGVuZ3RoOyB4KyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXJyYXkgRGF0YTogXCIgKyB0aGlzLmRhdGFBcnJheVt4XS51cmwgKyB0aGlzLmRhdGFBcnJheVt4XS5idWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnZXRBdWRpb0J1ZmZlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRBdWRpb0J1ZmZlckhvbGRlcigpOiBBdWRpb0RhdGEge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdWRpb0J1ZmZlckhvbGRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNldEF1ZGlvQnVmZmVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldEF1ZGlvQnVmZmVySG9sZGVyKF9hdWRpb0RhdGE6IEF1ZGlvRGF0YSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvQnVmZmVySG9sZGVyID0gX2F1ZGlvRGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEVycm9yIE1lc3NhZ2UgZm9yIERhdGEgRmV0Y2hpbmdcclxuICAgICAgICAgKiBAcGFyYW0gZSBFcnJvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgbG9nRXJyb3JGZXRjaChlOiBFcnJvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1ZGlvIGVycm9yXCIsIGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXNjcmliZXMgR2xvYmFsIEF1ZGlvIFNldHRpbmdzLlxyXG4gICAgICogSXMgbWVhbnQgdG8gYmUgdXNlZCBhcyBhIE1lbnUgb3B0aW9uLlxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpb1NldHRpbmdzIHtcclxuICAgICAgICBcclxuICAgICAgICAvL3B1YmxpYyBhdWRpb1Nlc3Npb25EYXRhOiBBdWRpb1Nlc3Npb25EYXRhO1xyXG5cclxuICAgICAgICAvL1RPRE8gQWRkIG1hc3RlckdhaW5cclxuICAgICAgICBwdWJsaWMgbWFzdGVyR2FpbjogR2Fpbk5vZGU7XHJcbiAgICAgICAgcHVibGljIG1hc3RlckdhaW5WYWx1ZTogbnVtYmVyO1xyXG5cclxuICAgICAgICAvLyBjb25zdD8gb3IgcHJpdmF0ZSB3aXRoIGdldHRlcj9cclxuICAgICAgICBwcml2YXRlIGdsb2JhbEF1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0O1xyXG5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnN0cnVjdG9yIGZvciBtYXN0ZXIgVm9sdW1lXHJcbiAgICAgICAgICogQHBhcmFtIF9nYWluVmFsdWUgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoX2dhaW5WYWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXVkaW9Db250ZXh0KG5ldyBBdWRpb0NvbnRleHQoeyBsYXRlbmN5SGludDogXCJpbnRlcmFjdGl2ZVwiLCBzYW1wbGVSYXRlOiA0NDEwMCB9KSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL3RoaXMuZ2xvYmFsQXVkaW9Db250ZXh0LnJlc3VtZSgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdsb2JhbEF1ZGlvQ29udGV4dDogXCIgKyB0aGlzLmdsb2JhbEF1ZGlvQ29udGV4dCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVyR2FpbiA9IHRoaXMuZ2xvYmFsQXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcclxuICAgICAgICAgICAgdGhpcy5tYXN0ZXJHYWluVmFsdWUgPSBfZ2FpblZhbHVlO1xyXG5cclxuICAgICAgICAgICAgLy90aGlzLmF1ZGlvU2Vzc2lvbkRhdGEgPSBuZXcgQXVkaW9TZXNzaW9uRGF0YSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldE1hc3RlckdhaW5WYWx1ZShfbWFzdGVyR2FpblZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5tYXN0ZXJHYWluVmFsdWUgPSBfbWFzdGVyR2FpblZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE1hc3RlckdhaW5WYWx1ZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXN0ZXJHYWluVmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QXVkaW9Db250ZXh0KCk6IEF1ZGlvQ29udGV4dCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdsb2JhbEF1ZGlvQ29udGV4dDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRBdWRpb0NvbnRleHQoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsQXVkaW9Db250ZXh0ID0gX2F1ZGlvQ29udGV4dDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vVE9ETyBhZGQgc3VzcGVuZC9yZXN1bWUgZnVuY3Rpb25zIGZvciBBdWRpb0NvbnRleHQgY29udHJvbHNcclxuICAgIH1cclxufSIsIi8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vQ29hdHMvQ29hdC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICB0eXBlIENvYXRJbmplY3Rpb24gPSAodGhpczogQ29hdCwgX3JlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyKSA9PiB2b2lkO1xyXG4gICAgZXhwb3J0IGNsYXNzIFJlbmRlckluamVjdG9yIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBjb2F0SW5qZWN0aW9uczogeyBbY2xhc3NOYW1lOiBzdHJpbmddOiBDb2F0SW5qZWN0aW9uIH0gPSB7XHJcbiAgICAgICAgICAgIFwiQ29hdENvbG9yZWRcIjogUmVuZGVySW5qZWN0b3IuaW5qZWN0UmVuZGVyRGF0YUZvckNvYXRDb2xvcmVkLFxyXG4gICAgICAgICAgICBcIkNvYXRUZXh0dXJlZFwiOiBSZW5kZXJJbmplY3Rvci5pbmplY3RSZW5kZXJEYXRhRm9yQ29hdFRleHR1cmVkLFxyXG4gICAgICAgICAgICBcIkNvYXRNYXRDYXBcIjogUmVuZGVySW5qZWN0b3IuaW5qZWN0UmVuZGVyRGF0YUZvckNvYXRNYXRDYXBcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRlY29yYXRlQ29hdChfY29uc3RydWN0b3I6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBjb2F0SW5qZWN0aW9uOiBDb2F0SW5qZWN0aW9uID0gUmVuZGVySW5qZWN0b3IuY29hdEluamVjdGlvbnNbX2NvbnN0cnVjdG9yLm5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoIWNvYXRJbmplY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKFwiTm8gaW5qZWN0aW9uIGRlY29yYXRvciBkZWZpbmVkIGZvciBcIiArIF9jb25zdHJ1Y3Rvci5uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2NvbnN0cnVjdG9yLnByb3RvdHlwZSwgXCJ1c2VSZW5kZXJEYXRhXCIsIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBjb2F0SW5qZWN0aW9uXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW5qZWN0UmVuZGVyRGF0YUZvckNvYXRDb2xvcmVkKHRoaXM6IENvYXQsIF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY29sb3JVbmlmb3JtTG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfY29sb3JcIl07XHJcbiAgICAgICAgICAgIC8vIGxldCB7IHIsIGcsIGIsIGEgfSA9ICg8Q29hdENvbG9yZWQ+dGhpcykuY29sb3I7XHJcbiAgICAgICAgICAgIC8vIGxldCBjb2xvcjogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbciwgZywgYiwgYV0pO1xyXG4gICAgICAgICAgICBsZXQgY29sb3I6IEZsb2F0MzJBcnJheSA9ICg8Q29hdENvbG9yZWQ+dGhpcykuY29sb3IuZ2V0QXJyYXkoKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuZ2V0UmVuZGVyaW5nQ29udGV4dCgpLnVuaWZvcm00ZnYoY29sb3JVbmlmb3JtTG9jYXRpb24sIGNvbG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGluamVjdFJlbmRlckRhdGFGb3JDb2F0VGV4dHVyZWQodGhpczogQ29hdCwgX3JlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBjcmMzOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0ID0gUmVuZGVyT3BlcmF0b3IuZ2V0UmVuZGVyaW5nQ29udGV4dCgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yZW5kZXJEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBidWZmZXJzIGV4aXN0XHJcbiAgICAgICAgICAgICAgICBjcmMzLmFjdGl2ZVRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFMCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgdGhpcy5yZW5kZXJEYXRhW1widGV4dHVyZTBcIl0pO1xyXG4gICAgICAgICAgICAgICAgY3JjMy51bmlmb3JtMWkoX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfdGV4dHVyZVwiXSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGFsbCBXZWJHTC1DcmVhdGlvbnMgYXJlIGFzc2VydGVkXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlOiBXZWJHTFRleHR1cmUgPSBSZW5kZXJNYW5hZ2VyLmFzc2VydDxXZWJHTFRleHR1cmU+KGNyYzMuY3JlYXRlVGV4dHVyZSgpKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyYzMudGV4SW1hZ2UyRChjcmMzLlRFWFRVUkVfMkQsIDAsIGNyYzMuUkdCQSwgY3JjMy5SR0JBLCBjcmMzLlVOU0lHTkVEX0JZVEUsICg8Q29hdFRleHR1cmVkPnRoaXMpLnRleHR1cmUuaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNyYzMudGV4SW1hZ2UyRChcclxuICAgICAgICAgICAgICAgICAgICAgICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCAwLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5VTlNJR05FRF9CWVRFLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoPENvYXRUZXh0dXJlZD50aGlzKS50ZXh0dXJlLmltYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGVidWcuZXJyb3IoX2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01BR19GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTkVBUkVTVCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfTUlOX0ZJTFRFUiwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5ORUFSRVNUKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuZ2VuZXJhdGVNaXBtYXAoY3JjMy5URVhUVVJFXzJEKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRGF0YVtcInRleHR1cmUwXCJdID0gdGV4dHVyZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZVJlbmRlckRhdGEoX3JlbmRlclNoYWRlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGluamVjdFJlbmRlckRhdGFGb3JDb2F0TWF0Q2FwKHRoaXM6IENvYXQsIF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY3JjMzogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9IFJlbmRlck9wZXJhdG9yLmdldFJlbmRlcmluZ0NvbnRleHQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb2xvclVuaWZvcm1Mb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSBfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV90aW50X2NvbG9yXCJdO1xyXG4gICAgICAgICAgICBsZXQgeyByLCBnLCBiLCBhIH0gPSAoPENvYXRNYXRDYXA+dGhpcykudGludENvbG9yO1xyXG4gICAgICAgICAgICBsZXQgdGludENvbG9yQXJyYXk6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW3IsIGcsIGIsIGFdKTtcclxuICAgICAgICAgICAgY3JjMy51bmlmb3JtNGZ2KGNvbG9yVW5pZm9ybUxvY2F0aW9uLCB0aW50Q29sb3JBcnJheSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmxvYXRVbmlmb3JtTG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfZmxhdG1peFwiXTtcclxuICAgICAgICAgICAgbGV0IGZsYXRNaXg6IG51bWJlciA9ICg8Q29hdE1hdENhcD50aGlzKS5mbGF0TWl4O1xyXG4gICAgICAgICAgICBjcmMzLnVuaWZvcm0xZihmbG9hdFVuaWZvcm1Mb2NhdGlvbiwgZmxhdE1peCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5yZW5kZXJEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBidWZmZXJzIGV4aXN0XHJcbiAgICAgICAgICAgICAgICBjcmMzLmFjdGl2ZVRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFMCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgdGhpcy5yZW5kZXJEYXRhW1widGV4dHVyZTBcIl0pO1xyXG4gICAgICAgICAgICAgICAgY3JjMy51bmlmb3JtMWkoX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfdGV4dHVyZVwiXSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGFsbCBXZWJHTC1DcmVhdGlvbnMgYXJlIGFzc2VydGVkXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlOiBXZWJHTFRleHR1cmUgPSBSZW5kZXJNYW5hZ2VyLmFzc2VydDxXZWJHTFRleHR1cmU+KGNyYzMuY3JlYXRlVGV4dHVyZSgpKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyYzMudGV4SW1hZ2UyRChjcmMzLlRFWFRVUkVfMkQsIDAsIGNyYzMuUkdCQSwgY3JjMy5SR0JBLCBjcmMzLlVOU0lHTkVEX0JZVEUsICg8Q29hdE1hdENhcD50aGlzKS50ZXh0dXJlLmltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBjcmMzLnRleEltYWdlMkQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgMCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5SR0JBLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfQllURSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDxDb2F0TWF0Q2FwPnRoaXMpLnRleHR1cmUuaW1hZ2VcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoX2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihfZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfTUFHX0ZJTFRFUiwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5ORUFSRVNUKTtcclxuICAgICAgICAgICAgICAgIGNyYzMudGV4UGFyYW1ldGVyaShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV9NSU5fRklMVEVSLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0Lk5FQVJFU1QpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5nZW5lcmF0ZU1pcG1hcChjcmMzLlRFWFRVUkVfMkQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJEYXRhW1widGV4dHVyZTBcIl0gPSB0ZXh0dXJlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBudWxsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlUmVuZGVyRGF0YShfcmVuZGVyU2hhZGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBCdWZmZXJTcGVjaWZpY2F0aW9uIHtcclxuICAgICAgICBzaXplOiBudW1iZXI7ICAgLy8gVGhlIHNpemUgb2YgdGhlIGRhdGFzYW1wbGUuXHJcbiAgICAgICAgZGF0YVR5cGU6IG51bWJlcjsgLy8gVGhlIGRhdGF0eXBlIG9mIHRoZSBzYW1wbGUgKGUuZy4gZ2wuRkxPQVQsIGdsLkJZVEUsIGV0Yy4pXHJcbiAgICAgICAgbm9ybWFsaXplOiBib29sZWFuOyAvLyBGbGFnIHRvIG5vcm1hbGl6ZSB0aGUgZGF0YS5cclxuICAgICAgICBzdHJpZGU6IG51bWJlcjsgLy8gTnVtYmVyIG9mIGluZGljZXMgdGhhdCB3aWxsIGJlIHNraXBwZWQgZWFjaCBpdGVyYXRpb24uXHJcbiAgICAgICAgb2Zmc2V0OiBudW1iZXI7IC8vIEluZGV4IG9mIHRoZSBlbGVtZW50IHRvIGJlZ2luIHdpdGguXHJcbiAgICB9XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFJlbmRlclNoYWRlciB7XHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgdGhpcyBzaG91bGQgYmUgaW5qZWN0ZWQgaW4gc2hhZGVyIGNsYXNzIHZpYSBSZW5kZXJJbmplY3RvciwgYXMgZG9uZSB3aXRoIENvYXRcclxuICAgICAgICBwcm9ncmFtOiBXZWJHTFByb2dyYW07XHJcbiAgICAgICAgYXR0cmlidXRlczogeyBbbmFtZTogc3RyaW5nXTogbnVtYmVyIH07XHJcbiAgICAgICAgdW5pZm9ybXM6IHsgW25hbWU6IHN0cmluZ106IFdlYkdMVW5pZm9ybUxvY2F0aW9uIH07XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZW5kZXJCdWZmZXJzIHtcclxuICAgICAgICAvLyBUT0RPOiBleGFtaW5lLCBpZiB0aGlzIHNob3VsZCBiZSBpbmplY3RlZCBpbiBtZXNoIGNsYXNzIHZpYSBSZW5kZXJJbmplY3RvciwgYXMgZG9uZSB3aXRoIENvYXRcclxuICAgICAgICB2ZXJ0aWNlczogV2ViR0xCdWZmZXI7XHJcbiAgICAgICAgaW5kaWNlczogV2ViR0xCdWZmZXI7XHJcbiAgICAgICAgbkluZGljZXM6IG51bWJlcjtcclxuICAgICAgICB0ZXh0dXJlVVZzOiBXZWJHTEJ1ZmZlcjtcclxuICAgICAgICBub3JtYWxzRmFjZTogV2ViR0xCdWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZW5kZXJDb2F0IHtcclxuICAgICAgICAvL1RPRE86IGV4YW1pbmUsIGlmIGl0IG1ha2VzIHNlbnNlIHRvIHN0b3JlIGEgdmFvIGZvciBlYWNoIENvYXQsIGV2ZW4gdGhvdWdoIGUuZy4gY29sb3Igd29uJ3QgYmUgc3RvcmVkIGFueXdheS4uLlxyXG4gICAgICAgIC8vdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0O1xyXG4gICAgICAgIGNvYXQ6IENvYXQ7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZW5kZXJMaWdodHMge1xyXG4gICAgICAgIFt0eXBlOiBzdHJpbmddOiBGbG9hdDMyQXJyYXk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlIGNsYXNzIGZvciBSZW5kZXJNYW5hZ2VyLCBoYW5kbGluZyB0aGUgY29ubmVjdGlvbiB0byB0aGUgcmVuZGVyaW5nIHN5c3RlbSwgaW4gdGhpcyBjYXNlIFdlYkdMLlxyXG4gICAgICogTWV0aG9kcyBhbmQgYXR0cmlidXRlcyBvZiB0aGlzIGNsYXNzIHNob3VsZCBub3QgYmUgY2FsbGVkIGRpcmVjdGx5LCBvbmx5IHRocm91Z2ggW1tSZW5kZXJNYW5hZ2VyXV1cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbmRlck9wZXJhdG9yIHtcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyYzM6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVjdFZpZXdwb3J0OiBSZWN0YW5nbGU7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyU2hhZGVyUmF5Q2FzdDogUmVuZGVyU2hhZGVyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIENoZWNrcyB0aGUgZmlyc3QgcGFyYW1ldGVyIGFuZCB0aHJvd3MgYW4gZXhjZXB0aW9uIHdpdGggdGhlIFdlYkdMLWVycm9yY29kZSBpZiB0aGUgdmFsdWUgaXMgbnVsbFxyXG4gICAgICAgICogQHBhcmFtIF92YWx1ZSAvLyB2YWx1ZSB0byBjaGVjayBhZ2FpbnN0IG51bGxcclxuICAgICAgICAqIEBwYXJhbSBfbWVzc2FnZSAvLyBvcHRpb25hbCwgYWRkaXRpb25hbCBtZXNzYWdlIGZvciB0aGUgZXhjZXB0aW9uXHJcbiAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzc2VydDxUPihfdmFsdWU6IFQgfCBudWxsLCBfbWVzc2FnZTogc3RyaW5nID0gXCJcIik6IFQge1xyXG4gICAgICAgICAgICBpZiAoX3ZhbHVlID09PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb24gZmFpbGVkLiAke19tZXNzYWdlfSwgV2ViR0wtRXJyb3I6ICR7UmVuZGVyT3BlcmF0b3IuY3JjMyA/IFJlbmRlck9wZXJhdG9yLmNyYzMuZ2V0RXJyb3IoKSA6IFwiXCJ9YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBfdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluaXRpYWxpemVzIG9mZnNjcmVlbi1jYW52YXMsIHJlbmRlcmluZ2NvbnRleHQgYW5kIGhhcmR3YXJlIHZpZXdwb3J0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNvbnRleHRBdHRyaWJ1dGVzOiBXZWJHTENvbnRleHRBdHRyaWJ1dGVzID0geyBhbHBoYTogZmFsc2UsIGFudGlhbGlhczogZmFsc2UgfTtcclxuICAgICAgICAgICAgbGV0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ+KFxyXG4gICAgICAgICAgICAgICAgY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbDJcIiwgY29udGV4dEF0dHJpYnV0ZXMpLFxyXG4gICAgICAgICAgICAgICAgXCJXZWJHTC1jb250ZXh0IGNvdWxkbid0IGJlIGNyZWF0ZWRcIlxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAvLyBFbmFibGUgYmFja2ZhY2UtIGFuZCB6QnVmZmVyLWN1bGxpbmcuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQ1VMTF9GQUNFKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5ERVBUSF9URVNUKTtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5waXhlbFN0b3JlaShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5yZWN0Vmlld3BvcnQgPSBSZW5kZXJPcGVyYXRvci5nZXRDYW52YXNSZWN0KCk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5yZW5kZXJTaGFkZXJSYXlDYXN0ID0gUmVuZGVyT3BlcmF0b3IuY3JlYXRlUHJvZ3JhbShTaGFkZXJSYXlDYXN0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgb2Zmc2NyZWVuLWNhbnZhc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q2FudmFzKCk6IEhUTUxDYW52YXNFbGVtZW50IHtcclxuICAgICAgICAgICAgcmV0dXJuIDxIVE1MQ2FudmFzRWxlbWVudD5SZW5kZXJPcGVyYXRvci5jcmMzLmNhbnZhczsgLy8gVE9ETzogZW5hYmxlIE9mZnNjcmVlbkNhbnZhc1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlIHJlbmRlcmluZyBjb250ZXh0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRSZW5kZXJpbmdDb250ZXh0KCk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVuZGVyT3BlcmF0b3IuY3JjMztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJuIGEgcmVjdGFuZ2xlIGRlc2NyaWJpbmcgdGhlIHNpemUgb2YgdGhlIG9mZnNjcmVlbi1jYW52YXMuIHgseSBhcmUgMCBhdCBhbGwgdGltZXMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDYW52YXNSZWN0KCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIGxldCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ID0gPEhUTUxDYW52YXNFbGVtZW50PlJlbmRlck9wZXJhdG9yLmNyYzMuY2FudmFzO1xyXG4gICAgICAgICAgICByZXR1cm4gUmVjdGFuZ2xlLkdFVCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgdGhlIHNpemUgb2YgdGhlIG9mZnNjcmVlbi1jYW52YXMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXRDYW52YXNTaXplKF93aWR0aDogbnVtYmVyLCBfaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5jYW52YXMud2lkdGggPSBfd2lkdGg7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuY2FudmFzLmhlaWdodCA9IF9oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCB0aGUgYXJlYSBvbiB0aGUgb2Zmc2NyZWVuLWNhbnZhcyB0byByZW5kZXIgdGhlIGNhbWVyYSBpbWFnZSB0by5cclxuICAgICAgICAgKiBAcGFyYW0gX3JlY3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNldFZpZXdwb3J0UmVjdGFuZ2xlKF9yZWN0OiBSZWN0YW5nbGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihSZW5kZXJPcGVyYXRvci5yZWN0Vmlld3BvcnQsIF9yZWN0KTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy52aWV3cG9ydChfcmVjdC54LCBfcmVjdC55LCBfcmVjdC53aWR0aCwgX3JlY3QuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmUgdGhlIGFyZWEgb24gdGhlIG9mZnNjcmVlbi1jYW52YXMgdGhlIGNhbWVyYSBpbWFnZSBnZXRzIHJlbmRlcmVkIHRvLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Vmlld3BvcnRSZWN0YW5nbGUoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlbmRlck9wZXJhdG9yLnJlY3RWaWV3cG9ydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnZlcnQgbGlnaHQgZGF0YSB0byBmbGF0IGFycmF5c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgY3JlYXRlUmVuZGVyTGlnaHRzKF9saWdodHM6IE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0KTogUmVuZGVyTGlnaHRzIHtcclxuICAgICAgICAgICAgbGV0IHJlbmRlckxpZ2h0czogUmVuZGVyTGlnaHRzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVudHJ5IG9mIF9saWdodHMpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZW50cnlbMF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIExpZ2h0QW1iaWVudC5uYW1lOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYW1iaWVudDogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbGlnaHQgb2YgZW50cnlbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjOiBDb2xvciA9IGxpZ2h0LmdldExpZ2h0KCkuY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbWJpZW50LnB1c2goYy5yLCBjLmcsIGMuYiwgYy5hKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMaWdodHNbXCJ1X2FtYmllbnRcIl0gPSBuZXcgRmxvYXQzMkFycmF5KGFtYmllbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIExpZ2h0RGlyZWN0aW9uYWwubmFtZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcmVjdGlvbmFsOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBsaWdodCBvZiBlbnRyeVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGM6IENvbG9yID0gbGlnaHQuZ2V0TGlnaHQoKS5jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkOiBWZWN0b3IzID0gKDxMaWdodERpcmVjdGlvbmFsPmxpZ2h0LmdldExpZ2h0KCkpLmRpcmVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbmFsLnB1c2goYy5yLCBjLmcsIGMuYiwgYy5hLCBkLngsIGQueSwgZC56KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMaWdodHNbXCJ1X2RpcmVjdGlvbmFsXCJdID0gbmV3IEZsb2F0MzJBcnJheShkaXJlY3Rpb25hbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERlYnVnLndhcm4oXCJTaGFkZXJzdHJ1Y3R1cmUgdW5kZWZpbmVkIGZvclwiLCBlbnRyeVswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckxpZ2h0cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBsaWdodCBkYXRhIGluIHNoYWRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHNldExpZ2h0c0luU2hhZGVyKF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciwgX2xpZ2h0czogTWFwTGlnaHRUeXBlVG9MaWdodExpc3QpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IudXNlUHJvZ3JhbShfcmVuZGVyU2hhZGVyKTtcclxuICAgICAgICAgICAgbGV0IHVuaTogeyBbbmFtZTogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb24gfSA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgYW1iaWVudDogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSB1bmlbXCJ1X2FtYmllbnQuY29sb3JcIl07XHJcbiAgICAgICAgICAgIGlmIChhbWJpZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY21wTGlnaHRzOiBDb21wb25lbnRMaWdodFtdID0gX2xpZ2h0cy5nZXQoXCJMaWdodEFtYmllbnRcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoY21wTGlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIHVwIGFtYmllbnQgbGlnaHRzIHRvIGEgc2luZ2xlIGNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IHJlc3VsdDogQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY21wTGlnaHQgb2YgY21wTGlnaHRzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3Igbm93LCBvbmx5IHRoZSBsYXN0IGlzIHJlbGV2YW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybTRmdihhbWJpZW50LCBjbXBMaWdodC5nZXRMaWdodCgpLmNvbG9yLmdldEFycmF5KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbkRpcmVjdGlvbmFsOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IHVuaVtcInVfbkxpZ2h0c0RpcmVjdGlvbmFsXCJdO1xyXG4gICAgICAgICAgICBpZiAobkRpcmVjdGlvbmFsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY21wTGlnaHRzOiBDb21wb25lbnRMaWdodFtdID0gX2xpZ2h0cy5nZXQoXCJMaWdodERpcmVjdGlvbmFsXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNtcExpZ2h0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuOiBudW1iZXIgPSBjbXBMaWdodHMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybTF1aShuRGlyZWN0aW9uYWwsIG4pO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxpZ2h0OiBMaWdodERpcmVjdGlvbmFsID0gPExpZ2h0RGlyZWN0aW9uYWw+Y21wTGlnaHRzW2ldLmdldExpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybTRmdih1bmlbYHVfZGlyZWN0aW9uYWxbJHtpfV0uY29sb3JgXSwgbGlnaHQuY29sb3IuZ2V0QXJyYXkoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXJlY3Rpb246IFZlY3RvcjMgPSBsaWdodC5kaXJlY3Rpb24uY29weTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLnRyYW5zZm9ybShjbXBMaWdodHNbaV0uZ2V0Q29udGFpbmVyKCkubXR4V29ybGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm0zZnYodW5pW2B1X2RpcmVjdGlvbmFsWyR7aX1dLmRpcmVjdGlvbmBdLCBkaXJlY3Rpb24uZ2V0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBkZWJ1Z2dlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXcgYSBtZXNoIGJ1ZmZlciB1c2luZyB0aGUgZ2l2ZW4gaW5mb3MgYW5kIHRoZSBjb21wbGV0ZSBwcm9qZWN0aW9uIG1hdHJpeFxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyU2hhZGVyIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyQnVmZmVycyBcclxuICAgICAgICAgKiBAcGFyYW0gX3JlbmRlckNvYXQgXHJcbiAgICAgICAgICogQHBhcmFtIF93b3JsZCBcclxuICAgICAgICAgKiBAcGFyYW0gX3Byb2plY3Rpb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBkcmF3KF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciwgX3JlbmRlckJ1ZmZlcnM6IFJlbmRlckJ1ZmZlcnMsIF9yZW5kZXJDb2F0OiBSZW5kZXJDb2F0LCBfd29ybGQ6IE1hdHJpeDR4NCwgX3Byb2plY3Rpb246IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci51c2VQcm9ncmFtKF9yZW5kZXJTaGFkZXIpO1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci51c2VCdWZmZXJzKF9yZW5kZXJCdWZmZXJzKTtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IudXNlUGFyYW1ldGVyKF9yZW5kZXJDb2F0KTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMudmVydGljZXMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0pO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5zZXRBdHRyaWJ1dGVTdHJ1Y3R1cmUoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV9wb3NpdGlvblwiXSwgTWVzaC5nZXRCdWZmZXJTcGVjaWZpY2F0aW9uKCkpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLmluZGljZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfdGV4dHVyZVVWc1wiXSkge1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy50ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV90ZXh0dXJlVVZzXCJdKTsgLy8gZW5hYmxlIHRoZSBidWZmZXJcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudmVydGV4QXR0cmliUG9pbnRlcihfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3RleHR1cmVVVnNcIl0sIDIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTdXBwbHkgbWF0cml4ZGF0YSB0byBzaGFkZXIuIFxyXG4gICAgICAgICAgICBsZXQgdVByb2plY3Rpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfcHJvamVjdGlvblwiXTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtTWF0cml4NGZ2KHVQcm9qZWN0aW9uLCBmYWxzZSwgX3Byb2plY3Rpb24uZ2V0KCkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3dvcmxkXCJdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdVdvcmxkOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3dvcmxkXCJdO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtTWF0cml4NGZ2KHVXb3JsZCwgZmFsc2UsIF93b3JsZC5nZXQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy5ub3JtYWxzRmFjZSk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfbm9ybWFsXCJdKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnNldEF0dHJpYnV0ZVN0cnVjdHVyZShfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX25vcm1hbFwiXSwgTWVzaC5nZXRCdWZmZXJTcGVjaWZpY2F0aW9uKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgaXMgYWxsIHRoYXQncyBsZWZ0IG9mIGNvYXQgaGFuZGxpbmcgaW4gUmVuZGVyT3BlcmF0b3IsIGR1ZSB0byBpbmplY3Rpb24uIFNvIGV4dHJhIHJlZmVyZW5jZSBmcm9tIG5vZGUgdG8gY29hdCBpcyB1bm5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBfcmVuZGVyQ29hdC5jb2F0LnVzZVJlbmRlckRhdGEoX3JlbmRlclNoYWRlcik7XHJcblxyXG4gICAgICAgICAgICAvLyBEcmF3IGNhbGxcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5kcmF3RWxlbWVudHMoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5UUklBTkdMRVMsIE1lc2guZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpLm9mZnNldCwgX3JlbmRlckJ1ZmZlcnMubkluZGljZXMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRyYXdFbGVtZW50cyhXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRSSUFOR0xFUywgX3JlbmRlckJ1ZmZlcnMubkluZGljZXMsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfU0hPUlQsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRHJhdyBhIGJ1ZmZlciB3aXRoIGEgc3BlY2lhbCBzaGFkZXIgdGhhdCB1c2VzIGFuIGlkIGluc3RlYWQgb2YgYSBjb2xvclxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyU2hhZGVyXHJcbiAgICAgICAgICogQHBhcmFtIF9yZW5kZXJCdWZmZXJzIFxyXG4gICAgICAgICAqIEBwYXJhbSBfd29ybGQgXHJcbiAgICAgICAgICogQHBhcmFtIF9wcm9qZWN0aW9uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZHJhd0ZvclJheUNhc3QoX2lkOiBudW1iZXIsIF9yZW5kZXJCdWZmZXJzOiBSZW5kZXJCdWZmZXJzLCBfd29ybGQ6IE1hdHJpeDR4NCwgX3Byb2plY3Rpb246IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIgPSBSZW5kZXJPcGVyYXRvci5yZW5kZXJTaGFkZXJSYXlDYXN0OyBcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IudXNlUHJvZ3JhbShyZW5kZXJTaGFkZXIpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy52ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3Bvc2l0aW9uXCJdKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3Iuc2V0QXR0cmlidXRlU3RydWN0dXJlKHJlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV9wb3NpdGlvblwiXSwgTWVzaC5nZXRCdWZmZXJTcGVjaWZpY2F0aW9uKCkpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLmluZGljZXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3VwcGx5IG1hdHJpeGRhdGEgdG8gc2hhZGVyLiBcclxuICAgICAgICAgICAgbGV0IHVQcm9qZWN0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IHJlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfcHJvamVjdGlvblwiXTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtTWF0cml4NGZ2KHVQcm9qZWN0aW9uLCBmYWxzZSwgX3Byb2plY3Rpb24uZ2V0KCkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfd29ybGRcIl0pIHtcclxuICAgICAgICAgICAgICAgIGxldCB1V29ybGQ6IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV93b3JsZFwiXTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybU1hdHJpeDRmdih1V29ybGQsIGZhbHNlLCBfd29ybGQuZ2V0KCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaWRVbmlmb3JtTG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV9pZFwiXTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuZ2V0UmVuZGVyaW5nQ29udGV4dCgpLnVuaWZvcm0xaShpZFVuaWZvcm1Mb2NhdGlvbiwgX2lkKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZHJhd0VsZW1lbnRzKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVFJJQU5HTEVTLCBfcmVuZGVyQnVmZmVycy5uSW5kaWNlcywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIFNoYWRlcnByb2dyYW0gXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBjcmVhdGVQcm9ncmFtKF9zaGFkZXJDbGFzczogdHlwZW9mIFNoYWRlcik6IFJlbmRlclNoYWRlciB7XHJcbiAgICAgICAgICAgIGxldCBjcmMzOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0ID0gUmVuZGVyT3BlcmF0b3IuY3JjMztcclxuICAgICAgICAgICAgbGV0IHByb2dyYW06IFdlYkdMUHJvZ3JhbSA9IGNyYzMuY3JlYXRlUHJvZ3JhbSgpO1xyXG4gICAgICAgICAgICBsZXQgcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXI7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xTaGFkZXI+KGNvbXBpbGVTaGFkZXIoX3NoYWRlckNsYXNzLmdldFZlcnRleFNoYWRlclNvdXJjZSgpLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlZFUlRFWF9TSEFERVIpKSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xTaGFkZXI+KGNvbXBpbGVTaGFkZXIoX3NoYWRlckNsYXNzLmdldEZyYWdtZW50U2hhZGVyU291cmNlKCksIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRlJBR01FTlRfU0hBREVSKSkpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5saW5rUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgICAgICAgICAgICAgIGxldCBlcnJvcjogc3RyaW5nID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PHN0cmluZz4oY3JjMy5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBsaW5raW5nIFNoYWRlcjogXCIgKyBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZW5kZXJTaGFkZXIgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbTogcHJvZ3JhbSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBkZXRlY3RBdHRyaWJ1dGVzKCksXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybXM6IGRldGVjdFVuaWZvcm1zKClcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgRGVidWcuZXJyb3IoX2Vycm9yKTtcclxuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJTaGFkZXI7XHJcblxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY29tcGlsZVNoYWRlcihfc2hhZGVyQ29kZTogc3RyaW5nLCBfc2hhZGVyVHlwZTogR0xlbnVtKTogV2ViR0xTaGFkZXIgfCBudWxsIHtcclxuICAgICAgICAgICAgICAgIGxldCB3ZWJHTFNoYWRlcjogV2ViR0xTaGFkZXIgPSBjcmMzLmNyZWF0ZVNoYWRlcihfc2hhZGVyVHlwZSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLnNoYWRlclNvdXJjZSh3ZWJHTFNoYWRlciwgX3NoYWRlckNvZGUpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5jb21waWxlU2hhZGVyKHdlYkdMU2hhZGVyKTtcclxuICAgICAgICAgICAgICAgIGxldCBlcnJvcjogc3RyaW5nID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PHN0cmluZz4oY3JjMy5nZXRTaGFkZXJJbmZvTG9nKHdlYkdMU2hhZGVyKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBjb21waWxpbmcgc2hhZGVyOiBcIiArIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBhbnkgY29tcGlsYXRpb24gZXJyb3JzLlxyXG4gICAgICAgICAgICAgICAgaWYgKCFjcmMzLmdldFNoYWRlclBhcmFtZXRlcih3ZWJHTFNoYWRlciwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGVydChjcmMzLmdldFNoYWRlckluZm9Mb2cod2ViR0xTaGFkZXIpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB3ZWJHTFNoYWRlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZXRlY3RBdHRyaWJ1dGVzKCk6IHsgW25hbWU6IHN0cmluZ106IG51bWJlciB9IHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRlY3RlZEF0dHJpYnV0ZXM6IHsgW25hbWU6IHN0cmluZ106IG51bWJlciB9ID0ge307XHJcbiAgICAgICAgICAgICAgICBsZXQgYXR0cmlidXRlQ291bnQ6IG51bWJlciA9IGNyYzMuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFDVElWRV9BVFRSSUJVVEVTKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhdHRyaWJ1dGVDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGF0dHJpYnV0ZUluZm86IFdlYkdMQWN0aXZlSW5mbyA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTEFjdGl2ZUluZm8+KGNyYzMuZ2V0QWN0aXZlQXR0cmliKHByb2dyYW0sIGkpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZUluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRldGVjdGVkQXR0cmlidXRlc1thdHRyaWJ1dGVJbmZvLm5hbWVdID0gY3JjMy5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBhdHRyaWJ1dGVJbmZvLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGVjdGVkQXR0cmlidXRlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZXRlY3RVbmlmb3JtcygpOiB7IFtuYW1lOiBzdHJpbmddOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiB9IHtcclxuICAgICAgICAgICAgICAgIGxldCBkZXRlY3RlZFVuaWZvcm1zOiB7IFtuYW1lOiBzdHJpbmddOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiB9ID0ge307XHJcbiAgICAgICAgICAgICAgICBsZXQgdW5pZm9ybUNvdW50OiBudW1iZXIgPSBjcmMzLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BQ1RJVkVfVU5JRk9STVMpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHVuaWZvcm1Db3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZm86IFdlYkdMQWN0aXZlSW5mbyA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTEFjdGl2ZUluZm8+KGNyYzMuZ2V0QWN0aXZlVW5pZm9ybShwcm9ncmFtLCBpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZXRlY3RlZFVuaWZvcm1zW2luZm8ubmFtZV0gPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xVbmlmb3JtTG9jYXRpb24+KGNyYzMuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIGluZm8ubmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGVjdGVkVW5pZm9ybXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyB1c2VQcm9ncmFtKF9zaGFkZXJJbmZvOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51c2VQcm9ncmFtKF9zaGFkZXJJbmZvLnByb2dyYW0pO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KF9zaGFkZXJJbmZvLmF0dHJpYnV0ZXNbXCJhX3Bvc2l0aW9uXCJdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBkZWxldGVQcm9ncmFtKF9wcm9ncmFtOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKF9wcm9ncmFtKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRlbGV0ZVByb2dyYW0oX3Byb2dyYW0ucHJvZ3JhbSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgX3Byb2dyYW0uYXR0cmlidXRlcztcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBfcHJvZ3JhbS51bmlmb3JtcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gTWVzaGJ1ZmZlclxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgY3JlYXRlQnVmZmVycyhfbWVzaDogTWVzaCk6IFJlbmRlckJ1ZmZlcnMge1xyXG4gICAgICAgICAgICBsZXQgdmVydGljZXM6IFdlYkdMQnVmZmVyID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQnVmZmVyPihSZW5kZXJPcGVyYXRvci5jcmMzLmNyZWF0ZUJ1ZmZlcigpKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCB2ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYnVmZmVyRGF0YShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX21lc2gudmVydGljZXMsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGljZXM6IFdlYkdMQnVmZmVyID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQnVmZmVyPihSZW5kZXJPcGVyYXRvci5jcmMzLmNyZWF0ZUJ1ZmZlcigpKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGljZXMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJ1ZmZlckRhdGEoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgX21lc2guaW5kaWNlcywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGV4dHVyZVVWczogV2ViR0xCdWZmZXIgPSBSZW5kZXJPcGVyYXRvci5jcmMzLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIHRleHR1cmVVVnMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJ1ZmZlckRhdGEoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9tZXNoLnRleHR1cmVVVnMsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5vcm1hbHNGYWNlOiBXZWJHTEJ1ZmZlciA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTEJ1ZmZlcj4oUmVuZGVyT3BlcmF0b3IuY3JjMy5jcmVhdGVCdWZmZXIoKSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgbm9ybWFsc0ZhY2UpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJ1ZmZlckRhdGEoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9tZXNoLm5vcm1hbHNGYWNlLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBidWZmZXJJbmZvOiBSZW5kZXJCdWZmZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgdmVydGljZXM6IHZlcnRpY2VzLFxyXG4gICAgICAgICAgICAgICAgaW5kaWNlczogaW5kaWNlcyxcclxuICAgICAgICAgICAgICAgIG5JbmRpY2VzOiBfbWVzaC5nZXRJbmRleENvdW50KCksXHJcbiAgICAgICAgICAgICAgICB0ZXh0dXJlVVZzOiB0ZXh0dXJlVVZzLFxyXG4gICAgICAgICAgICAgICAgbm9ybWFsc0ZhY2U6IG5vcm1hbHNGYWNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBidWZmZXJJbmZvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHVzZUJ1ZmZlcnMoX3JlbmRlckJ1ZmZlcnM6IFJlbmRlckJ1ZmZlcnMpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogY3VycmVudGx5IHVudXNlZCwgZG9uZSBzcGVjaWZpY2FsbHkgaW4gZHJhdy4gQ291bGQgYmUgc2F2ZWQgaW4gVkFPIHdpdGhpbiBSZW5kZXJCdWZmZXJzXHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMudmVydGljZXMpO1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMuaW5kaWNlcyk7XHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMudGV4dHVyZVVWcyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGRlbGV0ZUJ1ZmZlcnMoX3JlbmRlckJ1ZmZlcnM6IFJlbmRlckJ1ZmZlcnMpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKF9yZW5kZXJCdWZmZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5kZWxldGVCdWZmZXIoX3JlbmRlckJ1ZmZlcnMudmVydGljZXMpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5kZWxldGVCdWZmZXIoX3JlbmRlckJ1ZmZlcnMudGV4dHVyZVVWcyk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRlbGV0ZUJ1ZmZlcihfcmVuZGVyQnVmZmVycy5pbmRpY2VzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gTWF0ZXJpYWxQYXJhbWV0ZXJzXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBjcmVhdGVQYXJhbWV0ZXIoX2NvYXQ6IENvYXQpOiBSZW5kZXJDb2F0IHtcclxuICAgICAgICAgICAgLy8gbGV0IHZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTFZlcnRleEFycmF5T2JqZWN0PihSZW5kZXJPcGVyYXRvci5jcmMzLmNyZWF0ZVZlcnRleEFycmF5KCkpO1xyXG4gICAgICAgICAgICBsZXQgY29hdEluZm86IFJlbmRlckNvYXQgPSB7XHJcbiAgICAgICAgICAgICAgICAvL3ZhbzogbnVsbCxcclxuICAgICAgICAgICAgICAgIGNvYXQ6IF9jb2F0XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBjb2F0SW5mbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyB1c2VQYXJhbWV0ZXIoX2NvYXRJbmZvOiBSZW5kZXJDb2F0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZFZlcnRleEFycmF5KF9jb2F0SW5mby52YW8pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGRlbGV0ZVBhcmFtZXRlcihfY29hdEluZm86IFJlbmRlckNvYXQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKF9jb2F0SW5mbykge1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kVmVydGV4QXJyYXkobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLmRlbGV0ZVZlcnRleEFycmF5KF9jb2F0SW5mby52YW8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLyoqIFxyXG4gICAgICAgICAqIFdyYXBwZXIgZnVuY3Rpb24gdG8gdXRpbGl6ZSB0aGUgYnVmZmVyU3BlY2lmaWNhdGlvbiBpbnRlcmZhY2Ugd2hlbiBwYXNzaW5nIGRhdGEgdG8gdGhlIHNoYWRlciB2aWEgYSBidWZmZXIuXHJcbiAgICAgICAgICogQHBhcmFtIF9hdHRyaWJ1dGVMb2NhdGlvbiAvLyBUaGUgbG9jYXRpb24gb2YgdGhlIGF0dHJpYnV0ZSBvbiB0aGUgc2hhZGVyLCB0byB3aGljaCB0aGV5IGRhdGEgd2lsbCBiZSBwYXNzZWQuXHJcbiAgICAgICAgICogQHBhcmFtIF9idWZmZXJTcGVjaWZpY2F0aW9uIC8vIEludGVyZmFjZSBwYXNzaW5nIGRhdGFwdWxsc3BlY2lmaWNhdGlvbnMgdG8gdGhlIGJ1ZmZlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzZXRBdHRyaWJ1dGVTdHJ1Y3R1cmUoX2F0dHJpYnV0ZUxvY2F0aW9uOiBudW1iZXIsIF9idWZmZXJTcGVjaWZpY2F0aW9uOiBCdWZmZXJTcGVjaWZpY2F0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudmVydGV4QXR0cmliUG9pbnRlcihfYXR0cmlidXRlTG9jYXRpb24sIF9idWZmZXJTcGVjaWZpY2F0aW9uLnNpemUsIF9idWZmZXJTcGVjaWZpY2F0aW9uLmRhdGFUeXBlLCBfYnVmZmVyU3BlY2lmaWNhdGlvbi5ub3JtYWxpemUsIF9idWZmZXJTcGVjaWZpY2F0aW9uLnN0cmlkZSwgX2J1ZmZlclNwZWNpZmljYXRpb24ub2Zmc2V0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1JlbmRlci9SZW5kZXJJbmplY3Rvci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1JlbmRlci9SZW5kZXJPcGVyYXRvci50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEhvbGRzIGRhdGEgdG8gZmVlZCBpbnRvIGEgW1tTaGFkZXJdXSB0byBkZXNjcmliZSB0aGUgc3VyZmFjZSBvZiBbW01lc2hdXS4gIFxyXG4gICAgICogW1tNYXRlcmlhbF1dcyByZWZlcmVuY2UgW1tDb2F0XV0gYW5kIFtbU2hhZGVyXV0uICAgXHJcbiAgICAgKiBUaGUgbWV0aG9kIHVzZVJlbmRlckRhdGEgd2lsbCBiZSBpbmplY3RlZCBieSBbW1JlbmRlckluamVjdG9yXV0gYXQgcnVudGltZSwgZXh0ZW5kaW5nIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHRoaXMgY2xhc3MgdG8gZGVhbCB3aXRoIHRoZSByZW5kZXJlci5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvYXQgZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nID0gXCJDb2F0XCI7XHJcbiAgICAgICAgcHJvdGVjdGVkIHJlbmRlckRhdGE6IHtba2V5OiBzdHJpbmddOiB1bmtub3dufTtcclxuXHJcbiAgICAgICAgcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5tdXRhdGUoX211dGF0b3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHVzZVJlbmRlckRhdGEoX3JlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyKTogdm9pZCB7LyogaW5qZWN0ZWQgYnkgUmVuZGVySW5qZWN0b3IqLyB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB0aGlzLmdldE11dGF0b3IoKTsgXHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICB0aGlzLm11dGF0ZShfc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoKTogdm9pZCB7IC8qKi8gfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHNpbXBsZXN0IFtbQ29hdF1dIHByb3ZpZGluZyBqdXN0IGEgY29sb3JcclxuICAgICAqL1xyXG4gICAgQFJlbmRlckluamVjdG9yLmRlY29yYXRlQ29hdFxyXG4gICAgZXhwb3J0IGNsYXNzIENvYXRDb2xvcmVkIGV4dGVuZHMgQ29hdCB7XHJcbiAgICAgICAgcHVibGljIGNvbG9yOiBDb2xvcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoX2NvbG9yPzogQ29sb3IpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5jb2xvciA9IF9jb2xvciB8fCBuZXcgQ29sb3IoMC41LCAwLjUsIDAuNSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBbW0NvYXRdXSBwcm92aWRpbmcgYSB0ZXh0dXJlIGFuZCBhZGRpdGlvbmFsIGRhdGEgZm9yIHRleHR1cmluZ1xyXG4gICAgICovXHJcbiAgICBAUmVuZGVySW5qZWN0b3IuZGVjb3JhdGVDb2F0XHJcbiAgICBleHBvcnQgY2xhc3MgQ29hdFRleHR1cmVkIGV4dGVuZHMgQ29hdCB7XHJcbiAgICAgICAgcHVibGljIHRleHR1cmU6IFRleHR1cmVJbWFnZSA9IG51bGw7XHJcbiAgICAgICAgLy8ganVzdCBpZGVhcyBzbyBmYXJcclxuICAgICAgICBwdWJsaWMgdGlsaW5nWDogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyB0aWxpbmdZOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHJlcGV0aXRpb246IGJvb2xlYW47XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEEgW1tDb2F0XV0gdG8gYmUgdXNlZCBieSB0aGUgTWF0Q2FwIFNoYWRlciBwcm92aWRpbmcgYSB0ZXh0dXJlLCBhIHRpbnQgY29sb3IgKDAuNSBncmV5IGlzIG5ldXRyYWwpXHJcbiAgICAgKiBhbmQgYSBmbGF0TWl4IG51bWJlciBmb3IgbWl4aW5nIGJldHdlZW4gc21vb3RoIGFuZCBmbGF0IHNoYWRpbmcuXHJcbiAgICAgKi9cclxuICAgIEBSZW5kZXJJbmplY3Rvci5kZWNvcmF0ZUNvYXRcclxuICAgIGV4cG9ydCBjbGFzcyBDb2F0TWF0Q2FwIGV4dGVuZHMgQ29hdCB7XHJcbiAgICAgICAgcHVibGljIHRleHR1cmU6IFRleHR1cmVJbWFnZSA9IG51bGw7XHJcbiAgICAgICAgcHVibGljIHRpbnRDb2xvcjogQ29sb3IgPSBuZXcgQ29sb3IoMC41LCAwLjUsIDAuNSwgMSk7XHJcbiAgICAgICAgcHVibGljIGZsYXRNaXg6IG51bWJlciA9IDAuNTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoX3RleHR1cmU/OiBUZXh0dXJlSW1hZ2UsIF90aW50Y29sb3I/OiBDb2xvciwgX2ZsYXRtaXg/OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlID0gX3RleHR1cmUgfHwgbmV3IFRleHR1cmVJbWFnZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbnRDb2xvciA9IF90aW50Y29sb3IgfHwgbmV3IENvbG9yKDAuNSwgMC41LCAwLjUsIDEpO1xyXG4gICAgICAgICAgICB0aGlzLmZsYXRNaXggPSBfZmxhdG1peCA+IDEuMCA/IHRoaXMuZmxhdE1peCA9IDEuMCA6IHRoaXMuZmxhdE1peCA9IF9mbGF0bWl4IHx8IDAuNTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvU2VyaWFsaXplci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL011dGFibGUudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqIFxyXG4gICAgICogU3VwZXJjbGFzcyBmb3IgYWxsIFtbQ29tcG9uZW50XV1zIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIFtbTm9kZV1dcy5cclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudCBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHByb3RlY3RlZCBzaW5nbGV0b246IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHByaXZhdGUgY29udGFpbmVyOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBhY3RpdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGUoX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gX29uO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KF9vbiA/IEVWRU5ULkNPTVBPTkVOVF9BQ1RJVkFURSA6IEVWRU5ULkNPTVBPTkVOVF9ERUFDVElWQVRFKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBnZXQgaXNBY3RpdmUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIElzIHRydWUsIHdoZW4gb25seSBvbmUgaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudCBjbGFzcyBjYW4gYmUgYXR0YWNoZWQgdG8gYSBub2RlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldCBpc1NpbmdsZXRvbigpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2luZ2xldG9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIG5vZGUsIHRoaXMgY29tcG9uZW50IGlzIGN1cnJlbnRseSBhdHRhY2hlZCB0b1xyXG4gICAgICAgICAqIEByZXR1cm5zIFRoZSBjb250YWluZXIgbm9kZSBvciBudWxsLCBpZiB0aGUgY29tcG9uZW50IGlzIG5vdCBhdHRhY2hlZCB0b1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDb250YWluZXIoKTogTm9kZSB8IG51bGwge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250YWluZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRyaWVzIHRvIGFkZCB0aGUgY29tcG9uZW50IHRvIHRoZSBnaXZlbiBub2RlLCByZW1vdmluZyBpdCBmcm9tIHRoZSBwcmV2aW91cyBjb250YWluZXIgaWYgYXBwbGljYWJsZVxyXG4gICAgICAgICAqIEBwYXJhbSBfY29udGFpbmVyIFRoZSBub2RlIHRvIGF0dGFjaCB0aGlzIGNvbXBvbmVudCB0b1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRDb250YWluZXIoX2NvbnRhaW5lcjogTm9kZSB8IG51bGwpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyID09IF9jb250YWluZXIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGxldCBwcmV2aW91c0NvbnRhaW5lcjogTm9kZSA9IHRoaXMuY29udGFpbmVyO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzQ29udGFpbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ29udGFpbmVyLnJlbW92ZUNvbXBvbmVudCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gX2NvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRhaW5lcilcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRDb21wb25lbnQodGhpcyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSBwcmV2aW91c0NvbnRhaW5lcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdGhpcy5hY3RpdmVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gX3NlcmlhbGl6YXRpb24uYWN0aXZlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBfbXV0YXRvci5zaW5nbGV0b247XHJcbiAgICAgICAgICAgIGRlbGV0ZSBfbXV0YXRvci5jb250YWluZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkNvbXBvbmVudC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogSG9sZHMgZGlmZmVyZW50IHBsYXltb2RlcyB0aGUgYW5pbWF0aW9uIHVzZXMgdG8gcGxheSBiYWNrIGl0cyBhbmltYXRpb24uXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBlbnVtIEFOSU1BVElPTl9QTEFZTU9ERSB7XHJcbiAgICAvKipQbGF5cyBhbmltYXRpb24gaW4gYSBsb29wOiBpdCByZXN0YXJ0cyBvbmNlIGl0IGhpdCB0aGUgZW5kLiovXHJcbiAgICBMT09QLFxyXG4gICAgLyoqUGxheXMgYW5pbWF0aW9uIG9uY2UgYW5kIHN0b3BzIGF0IHRoZSBsYXN0IGtleS9mcmFtZSovXHJcbiAgICBQTEFZT05DRSxcclxuICAgIC8qKlBsYXlzIGFuaW1hdGlvbiBvbmNlIGFuZCBzdG9wcyBvbiB0aGUgZmlyc3Qga2V5L2ZyYW1lICovXHJcbiAgICBQTEFZT05DRVNUT1BBRlRFUixcclxuICAgIC8qKlBsYXlzIGFuaW1hdGlvbiBsaWtlIExPT1AsIGJ1dCBiYWNrd2FyZHMuKi9cclxuICAgIFJFVkVSU0VMT09QLFxyXG4gICAgLyoqQ2F1c2VzIHRoZSBhbmltYXRpb24gbm90IHRvIHBsYXkgYXQgYWxsLiBVc2VmdWwgZm9yIGp1bXBpbmcgdG8gdmFyaW91cyBwb3NpdGlvbnMgaW4gdGhlIGFuaW1hdGlvbiB3aXRob3V0IHByb2NlZWRpbmcgaW4gdGhlIGFuaW1hdGlvbi4qL1xyXG4gICAgU1RPUFxyXG4gICAgLy9UT0RPOiBhZGQgYW4gSU5IRVJJVCBhbmQgYSBQSU5HUE9ORyBtb2RlXHJcbiAgfVxyXG5cclxuICBleHBvcnQgZW51bSBBTklNQVRJT05fUExBWUJBQ0sge1xyXG4gICAgLy9UT0RPOiBhZGQgYW4gaW4tZGVwdGggZGVzY3JpcHRpb24gb2Ygd2hhdCBoYXBwZW5zIHRvIHRoZSBhbmltYXRpb24gKGFuZCBldmVudHMpIGRlcGVuZGluZyBvbiB0aGUgUGxheWJhY2suIFVzZSBHcmFwaHMgdG8gZXhwbGFpbi5cclxuICAgIC8qKkNhbGN1bGF0ZXMgdGhlIHN0YXRlIG9mIHRoZSBhbmltYXRpb24gYXQgdGhlIGV4YWN0IHBvc2l0aW9uIG9mIHRpbWUuIElnbm9yZXMgRlBTIHZhbHVlIG9mIGFuaW1hdGlvbi4qL1xyXG4gICAgVElNRUJBU0VEX0NPTlRJTk9VUyxcclxuICAgIC8qKkxpbWl0cyB0aGUgY2FsY3VsYXRpb24gb2YgdGhlIHN0YXRlIG9mIHRoZSBhbmltYXRpb24gdG8gdGhlIEZQUyB2YWx1ZSBvZiB0aGUgYW5pbWF0aW9uLiBTa2lwcyBmcmFtZXMgaWYgbmVlZGVkLiovXHJcbiAgICBUSU1FQkFTRURfUkFTVEVSRURfVE9fRlBTLFxyXG4gICAgLyoqVXNlcyB0aGUgRlBTIHZhbHVlIG9mIHRoZSBhbmltYXRpb24gdG8gYWR2YW5jZSBvbmNlIHBlciBmcmFtZSwgbm8gbWF0dGVyIHRoZSBzcGVlZCBvZiB0aGUgZnJhbWVzLiBEb2Vzbid0IHNraXAgYW55IGZyYW1lcy4qL1xyXG4gICAgRlJBTUVCQVNFRFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSG9sZHMgYSByZWZlcmVuY2UgdG8gYW4gW1tBbmltYXRpb25dXSBhbmQgY29udHJvbHMgaXQuIENvbnRyb2xzIHBsYXliYWNrIGFuZCBwbGF5bW9kZSBhcyB3ZWxsIGFzIHNwZWVkLlxyXG4gICAqIEBhdXRob3JzIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIENvbXBvbmVudEFuaW1hdG9yIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgIC8vVE9ETzogYWRkIGZ1bmN0aW9uYWxpdHkgdG8gYmxlbmQgZnJvbSBvbmUgYW5pbWF0aW9uIHRvIGFub3RoZXIuXHJcbiAgICBhbmltYXRpb246IEFuaW1hdGlvbjtcclxuICAgIHBsYXltb2RlOiBBTklNQVRJT05fUExBWU1PREU7XHJcbiAgICBwbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLO1xyXG4gICAgc3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWQ6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIHByaXZhdGUgbG9jYWxUaW1lOiBUaW1lO1xyXG4gICAgcHJpdmF0ZSBzcGVlZFNjYWxlOiBudW1iZXIgPSAxO1xyXG4gICAgcHJpdmF0ZSBsYXN0VGltZTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfYW5pbWF0aW9uOiBBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKFwiXCIpLCBfcGxheW1vZGU6IEFOSU1BVElPTl9QTEFZTU9ERSA9IEFOSU1BVElPTl9QTEFZTU9ERS5MT09QLCBfcGxheWJhY2s6IEFOSU1BVElPTl9QTEFZQkFDSyA9IEFOSU1BVElPTl9QTEFZQkFDSy5USU1FQkFTRURfQ09OVElOT1VTKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uID0gX2FuaW1hdGlvbjtcclxuICAgICAgdGhpcy5wbGF5bW9kZSA9IF9wbGF5bW9kZTtcclxuICAgICAgdGhpcy5wbGF5YmFjayA9IF9wbGF5YmFjaztcclxuXHJcbiAgICAgIHRoaXMubG9jYWxUaW1lID0gbmV3IFRpbWUoKTtcclxuXHJcbiAgICAgIC8vVE9ETzogdXBkYXRlIGFuaW1hdGlvbiB0b3RhbCB0aW1lIHdoZW4gbG9hZGluZyBhIGRpZmZlcmVudCBhbmltYXRpb24/XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG5cclxuICAgICAgTG9vcC5hZGRFdmVudExpc3RlbmVyKEVWRU5ULkxPT1BfRlJBTUUsIHRoaXMudXBkYXRlQW5pbWF0aW9uTG9vcC5iaW5kKHRoaXMpKTtcclxuICAgICAgVGltZS5nYW1lLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlQuVElNRV9TQ0FMRUQsIHRoaXMudXBkYXRlU2NhbGUuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHNwZWVkKF9zOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5zcGVlZFNjYWxlID0gX3M7XHJcbiAgICAgIHRoaXMudXBkYXRlU2NhbGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEp1bXBzIHRvIGEgY2VydGFpbiB0aW1lIGluIHRoZSBhbmltYXRpb24gdG8gcGxheSBmcm9tIHRoZXJlLlxyXG4gICAgICogQHBhcmFtIF90aW1lIFRoZSB0aW1lIHRvIGp1bXAgdG9cclxuICAgICAqL1xyXG4gICAganVtcFRvKF90aW1lOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5sb2NhbFRpbWUuc2V0KF90aW1lKTtcclxuICAgICAgdGhpcy5sYXN0VGltZSA9IF90aW1lO1xyXG4gICAgICBfdGltZSA9IF90aW1lICUgdGhpcy5hbmltYXRpb24udG90YWxUaW1lO1xyXG4gICAgICBsZXQgbXV0YXRvcjogTXV0YXRvciA9IHRoaXMuYW5pbWF0aW9uLmdldE11dGF0ZWQoX3RpbWUsIHRoaXMuY2FsY3VsYXRlRGlyZWN0aW9uKF90aW1lKSwgdGhpcy5wbGF5YmFjayk7XHJcbiAgICAgIHRoaXMuZ2V0Q29udGFpbmVyKCkuYXBwbHlBbmltYXRpb24obXV0YXRvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHRpbWUgb2YgdGhlIGFuaW1hdGlvbiwgbW9kdWxhdGVkIGZvciBhbmltYXRpb24gbGVuZ3RoLlxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50VGltZSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5sb2NhbFRpbWUuZ2V0KCkgJSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3JjZXMgYW4gdXBkYXRlIG9mIHRoZSBhbmltYXRpb24gZnJvbSBvdXRzaWRlLiBVc2VkIGluIHRoZSBWaWV3QW5pbWF0aW9uLiBTaG91bGRuJ3QgYmUgdXNlZCBkdXJpbmcgdGhlIGdhbWUuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlICh1bnNjYWxlZCkgdGltZSB0byB1cGRhdGUgdGhlIGFuaW1hdGlvbiB3aXRoLlxyXG4gICAgICogQHJldHVybnMgYSBUdXBlbCBjb250YWluaW5nIHRoZSBNdXRhdG9yIGZvciBBbmltYXRpb24gYW5kIHRoZSBwbGF5bW9kZSBjb3JyZWN0ZWQgdGltZS4gXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUFuaW1hdGlvbihfdGltZTogbnVtYmVyKTogW011dGF0b3IsIG51bWJlcl0ge1xyXG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVBbmltYXRpb25Mb29wKG51bGwsIF90aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyNyZWdpb24gdHJhbnNmZXJcclxuICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IHM6IFNlcmlhbGl6YXRpb24gPSBzdXBlci5zZXJpYWxpemUoKTtcclxuICAgICAgc1tcImFuaW1hdGlvblwiXSA9IHRoaXMuYW5pbWF0aW9uLnNlcmlhbGl6ZSgpO1xyXG4gICAgICBzW1wicGxheW1vZGVcIl0gPSB0aGlzLnBsYXltb2RlO1xyXG4gICAgICBzW1wicGxheWJhY2tcIl0gPSB0aGlzLnBsYXliYWNrO1xyXG4gICAgICBzW1wic3BlZWRTY2FsZVwiXSA9IHRoaXMuc3BlZWRTY2FsZTtcclxuICAgICAgc1tcInNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkXCJdID0gdGhpcy5zcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZDtcclxuXHJcbiAgICAgIHNbc3VwZXIuY29uc3RydWN0b3IubmFtZV0gPSBzdXBlci5zZXJpYWxpemUoKTtcclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc2VyaWFsaXplKF9zOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgdGhpcy5hbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKFwiXCIpO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvbi5kZXNlcmlhbGl6ZShfcy5hbmltYXRpb24pO1xyXG4gICAgICB0aGlzLnBsYXliYWNrID0gX3MucGxheWJhY2s7XHJcbiAgICAgIHRoaXMucGxheW1vZGUgPSBfcy5wbGF5bW9kZTtcclxuICAgICAgdGhpcy5zcGVlZFNjYWxlID0gX3Muc3BlZWRTY2FsZTtcclxuICAgICAgdGhpcy5zcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZCA9IF9zLnNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkO1xyXG5cclxuICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3Nbc3VwZXIuY29uc3RydWN0b3IubmFtZV0pO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiB1cGRhdGVBbmltYXRpb25cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgQW5pbWF0aW9uLlxyXG4gICAgICogR2V0cyBjYWxsZWQgZXZlcnkgdGltZSB0aGUgTG9vcCBmaXJlcyB0aGUgTE9PUF9GUkFNRSBFdmVudC5cclxuICAgICAqIFVzZXMgdGhlIGJ1aWx0LWluIHRpbWUgdW5sZXNzIGEgZGlmZmVyZW50IHRpbWUgaXMgc3BlY2lmaWVkLlxyXG4gICAgICogTWF5IGFsc28gYmUgY2FsbGVkIGZyb20gdXBkYXRlQW5pbWF0aW9uKCkuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdXBkYXRlQW5pbWF0aW9uTG9vcChfZTogRXZlbnQsIF90aW1lOiBudW1iZXIpOiBbTXV0YXRvciwgbnVtYmVyXSB7XHJcbiAgICAgIGlmICh0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUgPT0gMClcclxuICAgICAgICByZXR1cm4gW251bGwsIDBdO1xyXG4gICAgICBsZXQgdGltZTogbnVtYmVyID0gX3RpbWUgfHwgdGhpcy5sb2NhbFRpbWUuZ2V0KCk7XHJcbiAgICAgIGlmICh0aGlzLnBsYXliYWNrID09IEFOSU1BVElPTl9QTEFZQkFDSy5GUkFNRUJBU0VEKSB7XHJcbiAgICAgICAgdGltZSA9IHRoaXMubGFzdFRpbWUgKyAoMTAwMCAvIHRoaXMuYW5pbWF0aW9uLmZwcyk7XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGRpcmVjdGlvbjogbnVtYmVyID0gdGhpcy5jYWxjdWxhdGVEaXJlY3Rpb24odGltZSk7XHJcbiAgICAgIHRpbWUgPSB0aGlzLmFwcGx5UGxheW1vZGVzKHRpbWUpO1xyXG4gICAgICB0aGlzLmV4ZWN1dGVFdmVudHModGhpcy5hbmltYXRpb24uZ2V0RXZlbnRzVG9GaXJlKHRoaXMubGFzdFRpbWUsIHRpbWUsIHRoaXMucGxheWJhY2ssIGRpcmVjdGlvbikpO1xyXG5cclxuICAgICAgaWYgKHRoaXMubGFzdFRpbWUgIT0gdGltZSkge1xyXG4gICAgICAgIHRoaXMubGFzdFRpbWUgPSB0aW1lO1xyXG4gICAgICAgIHRpbWUgPSB0aW1lICUgdGhpcy5hbmltYXRpb24udG90YWxUaW1lO1xyXG4gICAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0gdGhpcy5hbmltYXRpb24uZ2V0TXV0YXRlZCh0aW1lLCBkaXJlY3Rpb24sIHRoaXMucGxheWJhY2spO1xyXG4gICAgICAgIGlmICh0aGlzLmdldENvbnRhaW5lcigpKSB7XHJcbiAgICAgICAgICB0aGlzLmdldENvbnRhaW5lcigpLmFwcGx5QW5pbWF0aW9uKG11dGF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW211dGF0b3IsIHRpbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbbnVsbCwgdGltZV07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyBhbGwgY3VzdG9tIGV2ZW50cyB0aGUgQW5pbWF0aW9uIHNob3VsZCBoYXZlIGZpcmVkIGJldHdlZW4gdGhlIGxhc3QgZnJhbWUgYW5kIHRoZSBjdXJyZW50IGZyYW1lLlxyXG4gICAgICogQHBhcmFtIGV2ZW50cyBhIGxpc3Qgb2YgbmFtZXMgb2YgY3VzdG9tIGV2ZW50cyB0byBmaXJlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZXhlY3V0ZUV2ZW50cyhldmVudHM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KGV2ZW50c1tpXSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBhY3R1YWwgdGltZSB0byB1c2UsIHVzaW5nIHRoZSBjdXJyZW50IHBsYXltb2Rlcy5cclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgdGltZSB0byBhcHBseSB0aGUgcGxheW1vZGVzIHRvXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmVjYWxjdWxhdGVkIHRpbWVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhcHBseVBsYXltb2RlcyhfdGltZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgc3dpdGNoICh0aGlzLnBsYXltb2RlKSB7XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuU1RPUDpcclxuICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsVGltZS5nZXRPZmZzZXQoKTtcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5QTEFZT05DRTpcclxuICAgICAgICAgIGlmIChfdGltZSA+PSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUgLSAwLjAxOyAgICAgLy9UT0RPOiB0aGlzIG1pZ2h0IGNhdXNlIHNvbWUgaXNzdWVzXHJcbiAgICAgICAgICBlbHNlIHJldHVybiBfdGltZTtcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5QTEFZT05DRVNUT1BBRlRFUjpcclxuICAgICAgICAgIGlmIChfdGltZSA+PSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUgKyAwLjAxOyAgICAgLy9UT0RPOiB0aGlzIG1pZ2h0IGNhdXNlIHNvbWUgaXNzdWVzXHJcbiAgICAgICAgICBlbHNlIHJldHVybiBfdGltZTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcmV0dXJuIF90aW1lO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBkaXJlY3Rpb24gdGhlIGFuaW1hdGlvbiBzaG91bGQgY3VycmVudGx5IGJlIHBsYXlpbmcgaW4uXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlIHRpbWUgYXQgd2hpY2ggdG8gY2FsY3VsYXRlIHRoZSBkaXJlY3Rpb25cclxuICAgICAqIEByZXR1cm5zIDEgaWYgZm9yd2FyZCwgMCBpZiBzdG9wLCAtMSBpZiBiYWNrd2FyZHNcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVEaXJlY3Rpb24oX3RpbWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgIHN3aXRjaCAodGhpcy5wbGF5bW9kZSkge1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlNUT1A6XHJcbiAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAvLyBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5QSU5HUE9ORzpcclxuICAgICAgICAvLyAgIGlmIChNYXRoLmZsb29yKF90aW1lIC8gdGhpcy5hbmltYXRpb24udG90YWxUaW1lKSAlIDIgPT0gMClcclxuICAgICAgICAvLyAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgLy8gICBlbHNlXHJcbiAgICAgICAgLy8gICAgIHJldHVybiAtMTtcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5SRVZFUlNFTE9PUDpcclxuICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5QTEFZT05DRTpcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5QTEFZT05DRVNUT1BBRlRFUjpcclxuICAgICAgICAgIGlmIChfdGltZSA+PSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVzIHRoZSBzY2FsZSBvZiB0aGUgYW5pbWF0aW9uIGlmIHRoZSB1c2VyIGNoYW5nZXMgaXQgb3IgaWYgdGhlIGdsb2JhbCBnYW1lIHRpbWVyIGNoYW5nZWQgaXRzIHNjYWxlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHVwZGF0ZVNjYWxlKCk6IHZvaWQge1xyXG4gICAgICBsZXQgbmV3U2NhbGU6IG51bWJlciA9IHRoaXMuc3BlZWRTY2FsZTtcclxuICAgICAgaWYgKHRoaXMuc3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWQpXHJcbiAgICAgICAgbmV3U2NhbGUgKj0gVGltZS5nYW1lLmdldFNjYWxlKCk7XHJcbiAgICAgIHRoaXMubG9jYWxUaW1lLnNldFNjYWxlKG5ld1NjYWxlKTtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG4gIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJDb21wb25lbnQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIFtbQ29tcG9uZW50QXVkaW9dXSB0byBhIFtbTm9kZV1dLlxyXG4gICAgICogT25seSBhIHNpbmdsZSBbW0F1ZGlvXV0gY2FuIGJlIHVzZWQgd2l0aGluIGEgc2luZ2xlIFtbQ29tcG9uZW50QXVkaW9dXVxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRBdWRpbyBleHRlbmRzIENvbXBvbmVudCB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhdWRpbzogQXVkaW87XHJcbiAgICAgICAgXHJcbiAgICAgICAgcHVibGljIGlzTG9jYWxpc2VkOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBsb2NhbGlzYXRpb246IEF1ZGlvTG9jYWxpc2F0aW9uIHwgbnVsbDtcclxuXHJcbiAgICAgICAgcHVibGljIGlzRmlsdGVyZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIGZpbHRlcjogQXVkaW9GaWx0ZXIgfCBudWxsO1xyXG5cclxuICAgICAgICBcclxuICAgICAgICBjb25zdHJ1Y3RvcihfYXVkaW86IEF1ZGlvKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldEF1ZGlvKF9hdWRpbyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0TG9jYWxpc2F0aW9uKF9sb2NhbGlzYXRpb246IEF1ZGlvTG9jYWxpc2F0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxpc2F0aW9uID0gX2xvY2FsaXNhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHBsYXlBdWRpb1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwbGF5QXVkaW8oX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8uaW5pdEJ1ZmZlclNvdXJjZShfYXVkaW9Db250ZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5idWZmZXJTb3VyY2Uuc3RhcnQoX2F1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGRzIGFuIFtbQXVkaW9dXSB0byB0aGUgW1tDb21wb25lbnRBdWRpb11dXHJcbiAgICAgICAgICogQHBhcmFtIF9hdWRpbyBEZWNvZGVkIEF1ZGlvIERhdGEgYXMgW1tBdWRpb11dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzZXRBdWRpbyhfYXVkaW86IEF1ZGlvKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8gPSBfYXVkaW87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpbmFsIGF0dGFjaG1lbnRzIGZvciB0aGUgQXVkaW8gTm9kZXMgaW4gZm9sbG93aW5nIG9yZGVyXHJcbiAgICAgICAgICogMS4gTG9jYWxpc2F0aW9uXHJcbiAgICAgICAgICogMi4gRmlsdGVyXHJcbiAgICAgICAgICogMy4gTWFzdGVyIEdhaW5cclxuICAgICAgICAgKiBjb25uZWN0QXVkaW9Ob2Rlc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHByaXZhdGUgY29ubmVjdEF1ZGlvTm9kZXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIC8vIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiQ29tcG9uZW50LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYSBbW0F1ZGlvTGlzdGVuZXJdXSB0byB0aGUgbm9kZVxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRBdWRpb0xpc3RlbmVyIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuXHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiQ29tcG9uZW50LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBlbnVtIEZJRUxEX09GX1ZJRVcge1xyXG4gICAgICAgIEhPUklaT05UQUwsIFZFUlRJQ0FMLCBESUFHT05BTFxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGlkZW50aWZpZXJzIGZvciB0aGUgdmFyaW91cyBwcm9qZWN0aW9ucyBhIGNhbWVyYSBjYW4gcHJvdmlkZS4gIFxyXG4gICAgICogVE9ETzogY2hhbmdlIGJhY2sgdG8gbnVtYmVyIGVudW0gaWYgc3RyaW5ncyBub3QgbmVlZGVkXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBlbnVtIFBST0pFQ1RJT04ge1xyXG4gICAgICAgIENFTlRSQUwgPSBcImNlbnRyYWxcIixcclxuICAgICAgICBPUlRIT0dSQVBISUMgPSBcIm9ydGhvZ3JhcGhpY1wiLFxyXG4gICAgICAgIERJTUVUUklDID0gXCJkaW1ldHJpY1wiLFxyXG4gICAgICAgIFNURVJFTyA9IFwic3RlcmVvXCJcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNhbWVyYSBjb21wb25lbnQgaG9sZHMgdGhlIHByb2plY3Rpb24tbWF0cml4IGFuZCBvdGhlciBkYXRhIG5lZWRlZCB0byByZW5kZXIgYSBzY2VuZSBmcm9tIHRoZSBwZXJzcGVjdGl2ZSBvZiB0aGUgbm9kZSBpdCBpcyBhdHRhY2hlZCB0by5cclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudENhbWVyYSBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAgICAgcHVibGljIHBpdm90OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICAgICAgLy9wcml2YXRlIG9ydGhvZ3JhcGhpYzogYm9vbGVhbiA9IGZhbHNlOyAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGltYWdlIHdpbGwgYmUgcmVuZGVyZWQgd2l0aCBwZXJzcGVjdGl2ZSBvciBvcnRob2dyYXBoaWMgcHJvamVjdGlvbi5cclxuICAgICAgICBwcml2YXRlIHByb2plY3Rpb246IFBST0pFQ1RJT04gPSBQUk9KRUNUSU9OLkNFTlRSQUw7XHJcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm06IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7IC8vIFRoZSBtYXRyaXggdG8gbXVsdGlwbHkgZWFjaCBzY2VuZSBvYmplY3RzIHRyYW5zZm9ybWF0aW9uIGJ5LCB0byBkZXRlcm1pbmUgd2hlcmUgaXQgd2lsbCBiZSBkcmF3bi5cclxuICAgICAgICBwcml2YXRlIGZpZWxkT2ZWaWV3OiBudW1iZXIgPSA0NTsgLy8gVGhlIGNhbWVyYSdzIHNlbnNvcmFuZ2xlLlxyXG4gICAgICAgIHByaXZhdGUgYXNwZWN0UmF0aW86IG51bWJlciA9IDEuMDtcclxuICAgICAgICBwcml2YXRlIGRpcmVjdGlvbjogRklFTERfT0ZfVklFVyA9IEZJRUxEX09GX1ZJRVcuRElBR09OQUw7XHJcbiAgICAgICAgcHJpdmF0ZSBiYWNrZ3JvdW5kQ29sb3I6IENvbG9yID0gbmV3IENvbG9yKDAsIDAsIDAsIDEpOyAvLyBUaGUgY29sb3Igb2YgdGhlIGJhY2tncm91bmQgdGhlIGNhbWVyYSB3aWxsIHJlbmRlci5cclxuICAgICAgICBwcml2YXRlIGJhY2tncm91bmRFbmFibGVkOiBib29sZWFuID0gdHJ1ZTsgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCB0aGUgYmFja2dyb3VuZCBvZiB0aGlzIGNhbWVyYSB3aWxsIGJlIHJlbmRlcmVkLlxyXG4gICAgICAgIC8vIFRPRE86IGV4YW1pbmUsIGlmIGJhY2tncm91bmQgc2hvdWxkIGJlIGFuIGF0dHJpYnV0ZSBvZiBDYW1lcmEgb3IgVmlld3BvcnRcclxuXHJcbiAgICAgICAgcHVibGljIGdldFByb2plY3Rpb24oKTogUFJPSkVDVElPTiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2plY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QmFja2dvdW5kQ29sb3IoKTogQ29sb3Ige1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QmFja2dyb3VuZEVuYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJhY2tncm91bmRFbmFibGVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEFzcGVjdCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hc3BlY3RSYXRpbztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRGaWVsZE9mVmlldygpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWVsZE9mVmlldztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXREaXJlY3Rpb24oKTogRklFTERfT0ZfVklFVyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG11bHRpcGxpa2F0aW9uIG9mIHRoZSB3b3JsZHRyYW5zZm9ybWF0aW9uIG9mIHRoZSBjYW1lcmEgY29udGFpbmVyIHdpdGggdGhlIHByb2plY3Rpb24gbWF0cml4XHJcbiAgICAgICAgICogQHJldHVybnMgdGhlIHdvcmxkLXByb2plY3Rpb24tbWF0cml4XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldCBWaWV3UHJvamVjdGlvbk1hdHJpeCgpOiBNYXRyaXg0eDQge1xyXG4gICAgICAgICAgICBsZXQgd29ybGQ6IE1hdHJpeDR4NCA9IHRoaXMucGl2b3Q7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB3b3JsZCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLmdldENvbnRhaW5lcigpLm10eFdvcmxkLCB0aGlzLnBpdm90KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBubyBjb250YWluZXIgbm9kZSBvciBubyB3b3JsZCB0cmFuc2Zvcm1hdGlvbiBmb3VuZCAtPiBjb250aW51ZSB3aXRoIHBpdm90IG9ubHlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdmlld01hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklOVkVSU0lPTih3b3JsZCk7IFxyXG4gICAgICAgICAgICByZXR1cm4gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMudHJhbnNmb3JtLCB2aWV3TWF0cml4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCB0aGUgY2FtZXJhIHRvIHBlcnNwZWN0aXZlIHByb2plY3Rpb24uIFRoZSB3b3JsZCBvcmlnaW4gaXMgaW4gdGhlIGNlbnRlciBvZiB0aGUgY2FudmFzZWxlbWVudC5cclxuICAgICAgICAgKiBAcGFyYW0gX2FzcGVjdCBUaGUgYXNwZWN0IHJhdGlvIGJldHdlZW4gd2lkdGggYW5kIGhlaWdodCBvZiBwcm9qZWN0aW9uc3BhY2UuKERlZmF1bHQgPSBjYW52YXMuY2xpZW50V2lkdGggLyBjYW52YXMuQ2xpZW50SGVpZ2h0KVxyXG4gICAgICAgICAqIEBwYXJhbSBfZmllbGRPZlZpZXcgVGhlIGZpZWxkIG9mIHZpZXcgaW4gRGVncmVlcy4gKERlZmF1bHQgPSA0NSlcclxuICAgICAgICAgKiBAcGFyYW0gX2RpcmVjdGlvbiBUaGUgcGxhbmUgb24gd2hpY2ggdGhlIGZpZWxkT2ZWaWV3LUFuZ2xlIGlzIGdpdmVuIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwcm9qZWN0Q2VudHJhbChfYXNwZWN0OiBudW1iZXIgPSB0aGlzLmFzcGVjdFJhdGlvLCBfZmllbGRPZlZpZXc6IG51bWJlciA9IHRoaXMuZmllbGRPZlZpZXcsIF9kaXJlY3Rpb246IEZJRUxEX09GX1ZJRVcgPSB0aGlzLmRpcmVjdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmFzcGVjdFJhdGlvID0gX2FzcGVjdDtcclxuICAgICAgICAgICAgdGhpcy5maWVsZE9mVmlldyA9IF9maWVsZE9mVmlldztcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLnByb2plY3Rpb24gPSBQUk9KRUNUSU9OLkNFTlRSQUw7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtID0gTWF0cml4NHg0LlBST0pFQ1RJT05fQ0VOVFJBTChfYXNwZWN0LCB0aGlzLmZpZWxkT2ZWaWV3LCAxLCAyMDAwLCB0aGlzLmRpcmVjdGlvbik7IC8vIFRPRE86IHJlbW92ZSBtYWdpYyBudW1iZXJzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCB0aGUgY2FtZXJhIHRvIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uLiBUaGUgb3JpZ2luIGlzIGluIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIGNhbnZhcy5cclxuICAgICAgICAgKiBAcGFyYW0gX2xlZnQgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIGxlZnQgYm9yZGVyLiAoRGVmYXVsdCA9IDApXHJcbiAgICAgICAgICogQHBhcmFtIF9yaWdodCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgcmlnaHQgYm9yZGVyLiAoRGVmYXVsdCA9IGNhbnZhcy5jbGllbnRXaWR0aClcclxuICAgICAgICAgKiBAcGFyYW0gX2JvdHRvbSBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgYm90dG9tIGJvcmRlci4oRGVmYXVsdCA9IGNhbnZhcy5jbGllbnRIZWlnaHQpXHJcbiAgICAgICAgICogQHBhcmFtIF90b3AgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIHRvcCBib3JkZXIuKERlZmF1bHQgPSAwKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBwcm9qZWN0T3J0aG9ncmFwaGljKF9sZWZ0OiBudW1iZXIgPSAwLCBfcmlnaHQ6IG51bWJlciA9IFJlbmRlck1hbmFnZXIuZ2V0Q2FudmFzKCkuY2xpZW50V2lkdGgsIF9ib3R0b206IG51bWJlciA9IFJlbmRlck1hbmFnZXIuZ2V0Q2FudmFzKCkuY2xpZW50SGVpZ2h0LCBfdG9wOiBudW1iZXIgPSAwKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMucHJvamVjdGlvbiA9IFBST0pFQ1RJT04uT1JUSE9HUkFQSElDO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IE1hdHJpeDR4NC5QUk9KRUNUSU9OX09SVEhPR1JBUEhJQyhfbGVmdCwgX3JpZ2h0LCBfYm90dG9tLCBfdG9wLCA0MDAsIC00MDApOyAvLyBUT0RPOiBleGFtaW5lIG1hZ2ljIG51bWJlcnMhXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIGNhbGN1bGF0ZWQgbm9ybWVkIGRpbWVuc2lvbiBvZiB0aGUgcHJvamVjdGlvbiBzcGFjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRQcm9qZWN0aW9uUmVjdGFuZ2xlKCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIGxldCB0YW5Gb3Y6IG51bWJlciA9IE1hdGgudGFuKE1hdGguUEkgKiB0aGlzLmZpZWxkT2ZWaWV3IC8gMzYwKTsgLy8gSGFsZiBvZiB0aGUgYW5nbGUsIHRvIGNhbGN1bGF0ZSBkaW1lbnNpb24gZnJvbSB0aGUgY2VudGVyIC0+IHJpZ2h0IGFuZ2xlXHJcbiAgICAgICAgICAgIGxldCB0YW5Ib3Jpem9udGFsOiBudW1iZXIgPSAwO1xyXG4gICAgICAgICAgICBsZXQgdGFuVmVydGljYWw6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT0gRklFTERfT0ZfVklFVy5ESUFHT05BTCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFzcGVjdDogbnVtYmVyID0gTWF0aC5zcXJ0KHRoaXMuYXNwZWN0UmF0aW8pO1xyXG4gICAgICAgICAgICAgICAgdGFuSG9yaXpvbnRhbCA9IHRhbkZvdiAqIGFzcGVjdDtcclxuICAgICAgICAgICAgICAgIHRhblZlcnRpY2FsID0gdGFuRm92IC8gYXNwZWN0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZGlyZWN0aW9uID09IEZJRUxEX09GX1ZJRVcuVkVSVElDQUwpIHtcclxuICAgICAgICAgICAgICAgIHRhblZlcnRpY2FsID0gdGFuRm92O1xyXG4gICAgICAgICAgICAgICAgdGFuSG9yaXpvbnRhbCA9IHRhblZlcnRpY2FsICogdGhpcy5hc3BlY3RSYXRpbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHsvL0ZPVl9ESVJFQ1RJT04uSE9SSVpPTlRBTFxyXG4gICAgICAgICAgICAgICAgdGFuSG9yaXpvbnRhbCA9IHRhbkZvdjtcclxuICAgICAgICAgICAgICAgIHRhblZlcnRpY2FsID0gdGFuSG9yaXpvbnRhbCAvIHRoaXMuYXNwZWN0UmF0aW87XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRhbkhvcml6b250YWwgKiAyLCB0YW5WZXJ0aWNhbCAqIDIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuYmFja2dyb3VuZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZEVuYWJsZWQ6IHRoaXMuYmFja2dyb3VuZEVuYWJsZWQsXHJcbiAgICAgICAgICAgICAgICBwcm9qZWN0aW9uOiB0aGlzLnByb2plY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBmaWVsZE9mVmlldzogdGhpcy5maWVsZE9mVmlldyxcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBhc3BlY3Q6IHRoaXMuYXNwZWN0UmF0aW8sXHJcbiAgICAgICAgICAgICAgICBwaXZvdDogdGhpcy5waXZvdC5zZXJpYWxpemUoKSxcclxuICAgICAgICAgICAgICAgIFtzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXTogc3VwZXIuc2VyaWFsaXplKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IF9zZXJpYWxpemF0aW9uLmJhY2tncm91bmRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kRW5hYmxlZCA9IF9zZXJpYWxpemF0aW9uLmJhY2tncm91bmRFbmFibGVkO1xyXG4gICAgICAgICAgICB0aGlzLnByb2plY3Rpb24gPSBfc2VyaWFsaXphdGlvbi5wcm9qZWN0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmZpZWxkT2ZWaWV3ID0gX3NlcmlhbGl6YXRpb24uZmllbGRPZlZpZXc7XHJcbiAgICAgICAgICAgIHRoaXMuYXNwZWN0UmF0aW8gPSBfc2VyaWFsaXphdGlvbi5hc3BlY3Q7XHJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gX3NlcmlhbGl6YXRpb24uZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLnBpdm90LmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLnBpdm90KTtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bc3VwZXIuY29uc3RydWN0b3IubmFtZV0pO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMucHJvamVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBQUk9KRUNUSU9OLk9SVEhPR1JBUEhJQzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RPcnRob2dyYXBoaWMoKTsgLy8gVE9ETzogc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFBST0pFQ1RJT04uQ0VOVFJBTDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RDZW50cmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvckF0dHJpYnV0ZVR5cGVzKF9tdXRhdG9yOiBNdXRhdG9yKTogTXV0YXRvckF0dHJpYnV0ZVR5cGVzIHtcclxuICAgICAgICAgICAgbGV0IHR5cGVzOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMgPSBzdXBlci5nZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3IpO1xyXG4gICAgICAgICAgICBpZiAodHlwZXMuZGlyZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgdHlwZXMuZGlyZWN0aW9uID0gRklFTERfT0ZfVklFVztcclxuICAgICAgICAgICAgaWYgKHR5cGVzLnByb2plY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB0eXBlcy5wcm9qZWN0aW9uID0gUFJPSkVDVElPTjtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBzdXBlci5tdXRhdGUoX211dGF0b3IpO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnByb2plY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgUFJPSkVDVElPTi5DRU5UUkFMOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdENlbnRyYWwodGhpcy5hc3BlY3RSYXRpbywgdGhpcy5maWVsZE9mVmlldywgdGhpcy5kaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBkZWxldGUgX211dGF0b3IudHJhbnNmb3JtO1xyXG4gICAgICAgICAgICBzdXBlci5yZWR1Y2VNdXRhdG9yKF9tdXRhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYSBbW0xpZ2h0XV0gdG8gdGhlIG5vZGVcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRMaWdodCBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAgICAgcHJpdmF0ZSBsaWdodDogTGlnaHQ7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9saWdodDogTGlnaHQgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2luZ2xldG9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHQgPSBfbGlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TGlnaHQoKTogTGlnaHQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYSBbW01hdGVyaWFsXV0gdG8gdGhlIG5vZGVcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRNYXRlcmlhbCBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAgICAgcHVibGljIG1hdGVyaWFsOiBNYXRlcmlhbDtcclxuXHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKF9tYXRlcmlhbDogTWF0ZXJpYWwgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWwgPSBfbWF0ZXJpYWw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbjtcclxuICAgICAgICAgICAgLyogYXQgdGhpcyBwb2ludCBvZiB0aW1lLCBzZXJpYWxpemF0aW9uIGFzIHJlc291cmNlIGFuZCBhcyBpbmxpbmUgb2JqZWN0IGlzIHBvc3NpYmxlLiBUT0RPOiBjaGVjayBpZiBpbmxpbmUgYmVjb21lcyBvYnNvbGV0ZSAqL1xyXG4gICAgICAgICAgICBsZXQgaWRNYXRlcmlhbDogc3RyaW5nID0gdGhpcy5tYXRlcmlhbC5pZFJlc291cmNlO1xyXG4gICAgICAgICAgICBpZiAoaWRNYXRlcmlhbClcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb24gPSB7IGlkTWF0ZXJpYWw6IGlkTWF0ZXJpYWwgfTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbiA9IHsgbWF0ZXJpYWw6IFNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMubWF0ZXJpYWwpIH07XHJcblxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdID0gc3VwZXIuc2VyaWFsaXplKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICBsZXQgbWF0ZXJpYWw6IE1hdGVyaWFsO1xyXG4gICAgICAgICAgICBpZiAoX3NlcmlhbGl6YXRpb24uaWRNYXRlcmlhbClcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsID0gPE1hdGVyaWFsPlJlc291cmNlTWFuYWdlci5nZXQoX3NlcmlhbGl6YXRpb24uaWRNYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsID0gPE1hdGVyaWFsPlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ubWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsID0gbWF0ZXJpYWw7XHJcbiAgICAgICAgICAgIHN1cGVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tNZXNoXV0gdG8gdGhlIG5vZGVcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRNZXNoIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgICAgICBwdWJsaWMgcGl2b3Q6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgICBwdWJsaWMgbWVzaDogTWVzaCA9IG51bGw7XHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfbWVzaDogTWVzaCA9IG51bGwpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5tZXNoID0gX21lc2g7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbjtcclxuICAgICAgICAgICAgLyogYXQgdGhpcyBwb2ludCBvZiB0aW1lLCBzZXJpYWxpemF0aW9uIGFzIHJlc291cmNlIGFuZCBhcyBpbmxpbmUgb2JqZWN0IGlzIHBvc3NpYmxlLiBUT0RPOiBjaGVjayBpZiBpbmxpbmUgYmVjb21lcyBvYnNvbGV0ZSAqL1xyXG4gICAgICAgICAgICBsZXQgaWRNZXNoOiBzdHJpbmcgPSB0aGlzLm1lc2guaWRSZXNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKGlkTWVzaClcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb24gPSB7IGlkTWVzaDogaWRNZXNoIH07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb24gPSB7IG1lc2g6IFNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMubWVzaCkgfTtcclxuXHJcbiAgICAgICAgICAgIHNlcmlhbGl6YXRpb24ucGl2b3QgPSB0aGlzLnBpdm90LnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdID0gc3VwZXIuc2VyaWFsaXplKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgbGV0IG1lc2g6IE1lc2g7XHJcbiAgICAgICAgICAgIGlmIChfc2VyaWFsaXphdGlvbi5pZE1lc2gpXHJcbiAgICAgICAgICAgICAgICBtZXNoID0gPE1lc2g+UmVzb3VyY2VNYW5hZ2VyLmdldChfc2VyaWFsaXphdGlvbi5pZE1lc2gpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBtZXNoID0gPE1lc2g+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5tZXNoKTtcclxuICAgICAgICAgICAgdGhpcy5tZXNoID0gbWVzaDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGl2b3QuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ucGl2b3QpO1xyXG4gICAgICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3Igc2NyaXB0cyB0aGUgdXNlciB3cml0ZXNcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRTY3JpcHQgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnNpbmdsZXRvbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgdGhpcy5tdXRhdGUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYSB0cmFuc2Zvcm0tW1tNYXRyaXg0eDRdXSB0byB0aGUgbm9kZSwgbW92aW5nLCBzY2FsaW5nIGFuZCByb3RhdGluZyBpdCBpbiBzcGFjZSByZWxhdGl2ZSB0byBpdHMgcGFyZW50LlxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudFRyYW5zZm9ybSBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAgICAgcHVibGljIGxvY2FsOiBNYXRyaXg0eDQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFkpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbCA9IF9tYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGxvY2FsOiB0aGlzLmxvY2FsLnNlcmlhbGl6ZSgpLFxyXG4gICAgICAgICAgICAgICAgW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdOiBzdXBlci5zZXJpYWxpemUoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bc3VwZXIuY29uc3RydWN0b3IubmFtZV0pO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2FsLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLmxvY2FsKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMubG9jYWwubXV0YXRlKF9tdXRhdG9yKTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy8gcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7IFxyXG4gICAgICAgIC8vICAgICByZXR1cm4gdGhpcy5sb2NhbC5nZXRNdXRhdG9yKCk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvLyBwdWJsaWMgZ2V0TXV0YXRvckF0dHJpYnV0ZVR5cGVzKF9tdXRhdG9yOiBNdXRhdG9yKTogTXV0YXRvckF0dHJpYnV0ZVR5cGVzIHtcclxuICAgICAgICAvLyAgICAgbGV0IHR5cGVzOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMgPSB0aGlzLmxvY2FsLmdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcik7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiB0eXBlcztcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBfbXV0YXRvci53b3JsZDtcclxuICAgICAgICAgICAgc3VwZXIucmVkdWNlTXV0YXRvcihfbXV0YXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59XHJcbiIsIi8vIDxyZWZlcmVuY2UgcGF0aD1cIkRlYnVnQWxlcnQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZmlsdGVycyBjb3JyZXNwb25kaW5nIHRvIGRlYnVnIGFjdGl2aXRpZXMsIG1vcmUgdG8gY29tZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZW51bSBERUJVR19GSUxURVIge1xyXG4gICAgICAgIE5PTkUgPSAweDAwLFxyXG4gICAgICAgIElORk8gPSAweDAxLFxyXG4gICAgICAgIExPRyA9IDB4MDIsXHJcbiAgICAgICAgV0FSTiA9IDB4MDQsXHJcbiAgICAgICAgRVJST1IgPSAweDA4LFxyXG4gICAgICAgIEFMTCA9IElORk8gfCBMT0cgfCBXQVJOIHwgRVJST1JcclxuICAgIH1cclxuICAgIC8vIHJlbWluZXNjZW50IG9mIGFuIGVhcmx5IGF0dGVtcHQgb2YgRGVidWdcclxuICAgIC8vIGV4cG9ydCBlbnVtIERFQlVHX1RBUkdFVCB7XHJcbiAgICAvLyAgICAgQ09OU09MRSA9IFwiY29uc29sZVwiLFxyXG4gICAgLy8gICAgIEFMRVJUID0gXCJhbGVydFwiLFxyXG4gICAgLy8gICAgIFRFWFRBUkVBID0gXCJ0ZXh0YXJlYVwiLFxyXG4gICAgLy8gICAgIERJQUxPRyA9IFwiZGlhbG9nXCIsXHJcbiAgICAvLyAgICAgRklMRSA9IFwiZmlsZVwiLFxyXG4gICAgLy8gICAgIFNFUlZFUiA9IFwic2VydmVyXCJcclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyBleHBvcnQgaW50ZXJmYWNlIE1hcERlYnVnVGFyZ2V0VG9GdW5jdGlvbiB7IFt0YXJnZXQ6IHN0cmluZ106IEZ1bmN0aW9uOyB9XHJcbiAgICBleHBvcnQgdHlwZSBNYXBEZWJ1Z1RhcmdldFRvRGVsZWdhdGUgPSBNYXA8RGVidWdUYXJnZXQsIEZ1bmN0aW9uPjtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTWFwRGVidWdGaWx0ZXJUb0RlbGVnYXRlIHsgW2ZpbHRlcjogbnVtYmVyXTogRnVuY3Rpb247IH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlIGNsYXNzIGZvciB0aGUgZGlmZmVyZW50IERlYnVnVGFyZ2V0cywgbWFpbmx5IGZvciB0ZWNobmljYWwgcHVycG9zZSBvZiBpbmhlcml0YW5jZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgRGVidWdUYXJnZXQge1xyXG4gICAgICAgIHB1YmxpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZTtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIG1lcmdlQXJndW1lbnRzKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCBvdXQ6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KF9tZXNzYWdlKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgYXJnIG9mIF9hcmdzKVxyXG4gICAgICAgICAgICAgICAgb3V0ICs9IFwiXFxuXCIgKyBKU09OLnN0cmluZ2lmeShhcmcsIG51bGwsIDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z1RhcmdldC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJvdXRpbmcgdG8gdGhlIGFsZXJ0IGJveFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWdBbGVydCBleHRlbmRzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRlbGVnYXRlczogTWFwRGVidWdGaWx0ZXJUb0RlbGVnYXRlID0ge1xyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLklORk9dOiBEZWJ1Z0FsZXJ0LmNyZWF0ZURlbGVnYXRlKFwiSW5mb1wiKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5MT0ddOiBEZWJ1Z0FsZXJ0LmNyZWF0ZURlbGVnYXRlKFwiTG9nXCIpLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLldBUk5dOiBEZWJ1Z0FsZXJ0LmNyZWF0ZURlbGVnYXRlKFwiV2FyblwiKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5FUlJPUl06IERlYnVnQWxlcnQuY3JlYXRlRGVsZWdhdGUoXCJFcnJvclwiKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjcmVhdGVEZWxlZ2F0ZShfaGVhZGxpbmU6IHN0cmluZyk6IEZ1bmN0aW9uIHtcclxuICAgICAgICAgICAgbGV0IGRlbGVnYXRlOiBGdW5jdGlvbiA9IGZ1bmN0aW9uIChfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiB2b2lkIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdXQ6IHN0cmluZyA9IF9oZWFkbGluZSArIFwiXFxuXFxuXCIgKyBEZWJ1Z1RhcmdldC5tZXJnZUFyZ3VtZW50cyhfbWVzc2FnZSwgLi4uX2FyZ3MpO1xyXG4gICAgICAgICAgICAgICAgYWxlcnQob3V0KTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z1RhcmdldC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJvdXRpbmcgdG8gdGhlIHN0YW5kYXJkLWNvbnNvbGVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIERlYnVnQ29uc29sZSBleHRlbmRzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRlbGVnYXRlczogTWFwRGVidWdGaWx0ZXJUb0RlbGVnYXRlID0ge1xyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLklORk9dOiBjb25zb2xlLmluZm8sXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuTE9HXTogY29uc29sZS5sb2csXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuV0FSTl06IGNvbnNvbGUud2FybixcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5FUlJPUl06IGNvbnNvbGUuZXJyb3JcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkRlYnVnSW50ZXJmYWNlcy50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkRlYnVnQWxlcnQudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0NvbnNvbGUudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgRGVidWctQ2xhc3Mgb2ZmZXJzIGZ1bmN0aW9ucyBrbm93biBmcm9tIHRoZSBjb25zb2xlLW9iamVjdCBhbmQgYWRkaXRpb25zLCBcclxuICAgICAqIHJvdXRpbmcgdGhlIGluZm9ybWF0aW9uIHRvIHZhcmlvdXMgW1tEZWJ1Z1RhcmdldHNdXSB0aGF0IGNhbiBiZSBlYXNpbHkgZGVmaW5lZCBieSB0aGUgZGV2ZWxvcGVycyBhbmQgcmVnaXN0ZXJkIGJ5IHVzZXJzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBEZWJ1ZyB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRm9yIGVhY2ggc2V0IGZpbHRlciwgdGhpcyBhc3NvY2lhdGl2ZSBhcnJheSBrZWVwcyByZWZlcmVuY2VzIHRvIHRoZSByZWdpc3RlcmVkIGRlbGVnYXRlIGZ1bmN0aW9ucyBvZiB0aGUgY2hvc2VuIFtbRGVidWdUYXJnZXRzXV1cclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgYW5vbnltb3VzIGZ1bmN0aW9uIHNldHRpbmcgdXAgYWxsIGZpbHRlcnNcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkZWxlZ2F0ZXM6IHsgW2ZpbHRlcjogbnVtYmVyXTogTWFwRGVidWdUYXJnZXRUb0RlbGVnYXRlIH0gPSB7XHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuSU5GT106IG5ldyBNYXAoW1tEZWJ1Z0NvbnNvbGUsIERlYnVnQ29uc29sZS5kZWxlZ2F0ZXNbREVCVUdfRklMVEVSLklORk9dXV0pLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLkxPR106IG5ldyBNYXAoW1tEZWJ1Z0NvbnNvbGUsIERlYnVnQ29uc29sZS5kZWxlZ2F0ZXNbREVCVUdfRklMVEVSLkxPR11dXSksXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuV0FSTl06IG5ldyBNYXAoW1tEZWJ1Z0NvbnNvbGUsIERlYnVnQ29uc29sZS5kZWxlZ2F0ZXNbREVCVUdfRklMVEVSLldBUk5dXV0pLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLkVSUk9SXTogbmV3IE1hcChbW0RlYnVnQ29uc29sZSwgRGVidWdDb25zb2xlLmRlbGVnYXRlc1tERUJVR19GSUxURVIuRVJST1JdXV0pXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGUtIC8gQWN0aXZhdGUgYSBmaWx0ZXIgZm9yIHRoZSBnaXZlbiBEZWJ1Z1RhcmdldC4gXHJcbiAgICAgICAgICogQHBhcmFtIF90YXJnZXRcclxuICAgICAgICAgKiBAcGFyYW0gX2ZpbHRlciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNldEZpbHRlcihfdGFyZ2V0OiBEZWJ1Z1RhcmdldCwgX2ZpbHRlcjogREVCVUdfRklMVEVSKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGZpbHRlciBpbiBEZWJ1Zy5kZWxlZ2F0ZXMpXHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZXNbZmlsdGVyXS5kZWxldGUoX3RhcmdldCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBmaWx0ZXIgaW4gREVCVUdfRklMVEVSKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkOiBudW1iZXIgPSBwYXJzZUludChmaWx0ZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlZCA9PSBERUJVR19GSUxURVIuQUxMKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgaWYgKF9maWx0ZXIgJiBwYXJzZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgRGVidWcuZGVsZWdhdGVzW3BhcnNlZF0uc2V0KF90YXJnZXQsIF90YXJnZXQuZGVsZWdhdGVzW3BhcnNlZF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIGluZm8oLi4uKSBkaXNwbGF5cyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHdpdGggbG93IHByaW9yaXR5XHJcbiAgICAgICAgICogQHBhcmFtIF9tZXNzYWdlXHJcbiAgICAgICAgICogQHBhcmFtIF9hcmdzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW5mbyhfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiB2b2lkIHtcclxuICAgICAgICAgICAgRGVidWcuZGVsZWdhdGUoREVCVUdfRklMVEVSLklORk8sIF9tZXNzYWdlLCBfYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlYnVnIGZ1bmN0aW9uIHRvIGJlIGltcGxlbWVudGVkIGJ5IHRoZSBEZWJ1Z1RhcmdldC4gXHJcbiAgICAgICAgICogbG9nKC4uLikgZGlzcGxheXMgaW5mb3JtYXRpb24gd2l0aCBtZWRpdW0gcHJpb3JpdHlcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2VcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3MgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBsb2coX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlKERFQlVHX0ZJTFRFUi5MT0csIF9tZXNzYWdlLCBfYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlYnVnIGZ1bmN0aW9uIHRvIGJlIGltcGxlbWVudGVkIGJ5IHRoZSBEZWJ1Z1RhcmdldC4gXHJcbiAgICAgICAgICogd2FybiguLi4pIGRpc3BsYXlzIGluZm9ybWF0aW9uIGFib3V0IG5vbi1jb25mb3JtaXRpZXMgaW4gdXNhZ2UsIHdoaWNoIGlzIGVtcGhhc2l6ZWQgZS5nLiBieSBjb2xvclxyXG4gICAgICAgICAqIEBwYXJhbSBfbWVzc2FnZVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHdhcm4oX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlKERFQlVHX0ZJTFRFUi5XQVJOLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIGVycm9yKC4uLikgZGlzcGxheXMgY3JpdGljYWwgaW5mb3JtYXRpb24gYWJvdXQgZmFpbHVyZXMsIHdoaWNoIGlzIGVtcGhhc2l6ZWQgZS5nLiBieSBjb2xvclxyXG4gICAgICAgICAqIEBwYXJhbSBfbWVzc2FnZVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGVycm9yKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZShERUJVR19GSUxURVIuRVJST1IsIF9tZXNzYWdlLCBfYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvb2t1cCBhbGwgZGVsZWdhdGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGZpbHRlciBhbmQgY2FsbCB0aGVtIHVzaW5nIHRoZSBnaXZlbiBhcmd1bWVudHNcclxuICAgICAgICAgKiBAcGFyYW0gX2ZpbHRlciBcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2UgXHJcbiAgICAgICAgICogQHBhcmFtIF9hcmdzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGRlbGVnYXRlKF9maWx0ZXI6IERFQlVHX0ZJTFRFUiwgX21lc3NhZ2U6IE9iamVjdCwgX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBkZWxlZ2F0ZXM6IE1hcERlYnVnVGFyZ2V0VG9EZWxlZ2F0ZSA9IERlYnVnLmRlbGVnYXRlc1tfZmlsdGVyXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZGVsZWdhdGUgb2YgZGVsZWdhdGVzLnZhbHVlcygpKVxyXG4gICAgICAgICAgICAgICAgaWYgKF9hcmdzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZWdhdGUoX21lc3NhZ2UsIC4uLl9hcmdzKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZShfbWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkRlYnVnVGFyZ2V0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogUm91dGluZyB0byBhIEhUTUxEaWFsb2dFbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBEZWJ1Z0RpYWxvZyBleHRlbmRzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICAvLyBUT0RPOiBjaGVja291dCBIVE1MRGlhbG9nRWxlbWVudDsgISEhXHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdUYXJnZXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSb3V0ZSB0byBhbiBIVE1MVGV4dEFyZWEsIG1heSBiZSBvYnNvbGV0ZSB3aGVuIHVzaW5nIEhUTUxEaWFsb2dFbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBEZWJ1Z1RleHRBcmVhIGV4dGVuZHMgRGVidWdUYXJnZXQge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGV4dEFyZWE6IEhUTUxUZXh0QXJlYUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGV4dGFyZWFcIik7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSA9IHtcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5JTkZPXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIkluZm9cIilcclxuICAgICAgICB9O1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRGVsZWdhdGUoX2hlYWRsaW5lOiBzdHJpbmcpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBkZWxlZ2F0ZTogRnVuY3Rpb24gPSBmdW5jdGlvbiAoX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0OiBzdHJpbmcgPSBfaGVhZGxpbmUgKyBcIlxcblxcblwiICsgRGVidWdUYXJnZXQubWVyZ2VBcmd1bWVudHMoX21lc3NhZ2UsIF9hcmdzKTtcclxuICAgICAgICAgICAgICAgIERlYnVnVGV4dEFyZWEudGV4dEFyZWEudGV4dENvbnRlbnQgKz0gb3V0O1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgYSBjb2xvciBhcyB2YWx1ZXMgaW4gdGhlIHJhbmdlIG9mIDAgdG8gMSBmb3IgdGhlIGZvdXIgY2hhbm5lbHMgcmVkLCBncmVlbiwgYmx1ZSBhbmQgYWxwaGEgKGZvciBvcGFjaXR5KVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29sb3IgZXh0ZW5kcyBNdXRhYmxlIHsgLy9pbXBsZW1lbnRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgcHVibGljIHI6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgZzogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBiOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGE6IG51bWJlcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoX3I6IG51bWJlciA9IDEsIF9nOiBudW1iZXIgPSAxLCBfYjogbnVtYmVyID0gMSwgX2E6IG51bWJlciA9IDEpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXROb3JtUkdCQShfciwgX2csIF9iLCBfYSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldCBCTEFDSygpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMCwgMCwgMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IFdISVRFKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvcigxLCAxLCAxLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgUkVEKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvcigxLCAwLCAwLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgR1JFRU4oKTogQ29sb3Ige1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yKDAsIDEsIDAsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldCBCTFVFKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvcigwLCAwLCAxLCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXROb3JtUkdCQShfcjogbnVtYmVyLCBfZzogbnVtYmVyLCBfYjogbnVtYmVyLCBfYTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuciA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9yKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZyA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9nKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYiA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9iKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYSA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9hKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0Qnl0ZXNSR0JBKF9yOiBudW1iZXIsIF9nOiBudW1iZXIsIF9iOiBudW1iZXIsIF9hOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zZXROb3JtUkdCQShfciAvIDI1NSwgX2cgLyAyNTUsIF9iIC8gMjU1LCBfYSAvIDI1NSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QXJyYXkoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoW3RoaXMuciwgdGhpcy5nLCB0aGlzLmIsIHRoaXMuYV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldEFycmF5Tm9ybVJHQkEoX2NvbG9yOiBGbG9hdDMyQXJyYXkpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zZXROb3JtUkdCQShfY29sb3JbMF0sIF9jb2xvclsxXSwgX2NvbG9yWzJdLCBfY29sb3JbM10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldEFycmF5Qnl0ZXNSR0JBKF9jb2xvcjogVWludDhDbGFtcGVkQXJyYXkpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRCeXRlc1JHQkEoX2NvbG9yWzBdLCBfY29sb3JbMV0sIF9jb2xvclsyXSwgX2NvbG9yWzNdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7LyoqICovIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIG1hdGVyaWFscy4gQ29tYmluZXMgYSBbW1NoYWRlcl1dIHdpdGggYSBjb21wYXRpYmxlIFtbQ29hdF1dXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTWF0ZXJpYWwgaW1wbGVtZW50cyBTZXJpYWxpemFibGVSZXNvdXJjZSB7XHJcbiAgICAgICAgLyoqIFRoZSBuYW1lIHRvIGNhbGwgdGhlIE1hdGVyaWFsIGJ5LiAqL1xyXG4gICAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIGlkUmVzb3VyY2U6IHN0cmluZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICBwcml2YXRlIHNoYWRlclR5cGU6IHR5cGVvZiBTaGFkZXI7IC8vIFRoZSBzaGFkZXIgcHJvZ3JhbSB1c2VkIGJ5IHRoaXMgQmFzZU1hdGVyaWFsXHJcbiAgICAgICAgcHJpdmF0ZSBjb2F0OiBDb2F0O1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX3NoYWRlcj86IHR5cGVvZiBTaGFkZXIsIF9jb2F0PzogQ29hdCkge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBfbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5zaGFkZXJUeXBlID0gX3NoYWRlcjtcclxuICAgICAgICAgICAgaWYgKF9zaGFkZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfY29hdClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENvYXQoX2NvYXQpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Q29hdCh0aGlzLmNyZWF0ZUNvYXRNYXRjaGluZ1NoYWRlcigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhIG5ldyBbW0NvYXRdXSBpbnN0YW5jZSB0aGF0IGlzIHZhbGlkIGZvciB0aGUgW1tTaGFkZXJdXSByZWZlcmVuY2VkIGJ5IHRoaXMgbWF0ZXJpYWxcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY3JlYXRlQ29hdE1hdGNoaW5nU2hhZGVyKCk6IENvYXQge1xyXG4gICAgICAgICAgICBsZXQgY29hdDogQ29hdCA9IG5ldyAodGhpcy5zaGFkZXJUeXBlLmdldENvYXQoKSkoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvYXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNYWtlcyB0aGlzIG1hdGVyaWFsIHJlZmVyZW5jZSB0aGUgZ2l2ZW4gW1tDb2F0XV0gaWYgaXQgaXMgY29tcGF0aWJsZSB3aXRoIHRoZSByZWZlcmVuY2VkIFtbU2hhZGVyXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2NvYXQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldENvYXQoX2NvYXQ6IENvYXQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKF9jb2F0LmNvbnN0cnVjdG9yICE9IHRoaXMuc2hhZGVyVHlwZS5nZXRDb2F0KCkpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyAobmV3IEVycm9yKFwiU2hhZGVyIGFuZCBjb2F0IGRvbid0IG1hdGNoXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5jb2F0ID0gX2NvYXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50bHkgcmVmZXJlbmNlZCBbW0NvYXRdXSBpbnN0YW5jZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDb2F0KCk6IENvYXQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2F0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hhbmdlcyB0aGUgbWF0ZXJpYWxzIHJlZmVyZW5jZSB0byB0aGUgZ2l2ZW4gW1tTaGFkZXJdXSwgY3JlYXRlcyBhbmQgcmVmZXJlbmNlcyBhIG5ldyBbW0NvYXRdXSBpbnN0YW5jZSAgXHJcbiAgICAgICAgICogYW5kIG11dGF0ZXMgdGhlIG5ldyBjb2F0IHRvIHByZXNlcnZlIG1hdGNoaW5nIHByb3BlcnRpZXMuXHJcbiAgICAgICAgICogQHBhcmFtIF9zaGFkZXJUeXBlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRTaGFkZXIoX3NoYWRlclR5cGU6IHR5cGVvZiBTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zaGFkZXJUeXBlID0gX3NoYWRlclR5cGU7XHJcbiAgICAgICAgICAgIGxldCBjb2F0OiBDb2F0ID0gdGhpcy5jcmVhdGVDb2F0TWF0Y2hpbmdTaGFkZXIoKTtcclxuICAgICAgICAgICAgY29hdC5tdXRhdGUodGhpcy5jb2F0LmdldE11dGF0b3IoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBbW1NoYWRlcl1dIHJlZmVyZW5jZWQgYnkgdGhpcyBtYXRlcmlhbFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRTaGFkZXIoKTogdHlwZW9mIFNoYWRlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRlclR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgLy8gVE9ETzogdGhpcyB0eXBlIG9mIHNlcmlhbGl6YXRpb24gd2FzIGltcGxlbWVudGVkIGZvciBpbXBsaWNpdCBNYXRlcmlhbCBjcmVhdGUuIENoZWNrIGlmIG9ic29sZXRlIHdoZW4gb25seSBvbmUgbWF0ZXJpYWwgY2xhc3MgZXhpc3RzIGFuZC9vciBtYXRlcmlhbHMgYXJlIHN0b3JlZCBzZXBhcmF0ZWx5XHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBpZFJlc291cmNlOiB0aGlzLmlkUmVzb3VyY2UsXHJcbiAgICAgICAgICAgICAgICBzaGFkZXI6IHRoaXMuc2hhZGVyVHlwZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgY29hdDogU2VyaWFsaXplci5zZXJpYWxpemUodGhpcy5jb2F0KVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gX3NlcmlhbGl6YXRpb24ubmFtZTtcclxuICAgICAgICAgICAgdGhpcy5pZFJlc291cmNlID0gX3NlcmlhbGl6YXRpb24uaWRSZXNvdXJjZTtcclxuICAgICAgICAgICAgLy8gVE9ETzogcHJvdmlkZSBmb3Igc2hhZGVycyBpbiB0aGUgdXNlcnMgbmFtZXNwYWNlLiBTZWUgU2VyaWFsaXplciBmdWxscGF0aCBldGMuXHJcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tYW55XHJcbiAgICAgICAgICAgIHRoaXMuc2hhZGVyVHlwZSA9ICg8YW55PkZ1ZGdlQ29yZSlbX3NlcmlhbGl6YXRpb24uc2hhZGVyXTtcclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSA8Q29hdD5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLmNvYXQpO1xyXG4gICAgICAgICAgICB0aGlzLnNldENvYXQoY29hdCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBLZWVwcyBhIGRlcG90IG9mIG9iamVjdHMgdGhhdCBoYXZlIGJlZW4gbWFya2VkIGZvciByZXVzZSwgc29ydGVkIGJ5IHR5cGUuICBcclxuICAgICAqIFVzaW5nIFtbUmVjeWNsZXJdXSByZWR1Y2VzIGxvYWQgb24gdGhlIGNhcmJhZ2UgY29sbGVjdG9yIGFuZCB0aHVzIHN1cHBvcnRzIHNtb290aCBwZXJmb3JtYW5jZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVjeWNsZXIge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGRlcG90OiB7IFt0eXBlOiBzdHJpbmddOiBPYmplY3RbXSB9ID0ge307XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYW4gb2JqZWN0IG9mIHRoZSByZXF1ZXN0ZWQgdHlwZSBmcm9tIHRoZSBkZXBvdCwgb3IgYSBuZXcgb25lLCBpZiB0aGUgZGVwb3Qgd2FzIGVtcHR5IFxyXG4gICAgICAgICAqIEBwYXJhbSBfVCBUaGUgY2xhc3MgaWRlbnRpZmllciBvZiB0aGUgZGVzaXJlZCBvYmplY3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldDxUPihfVDogbmV3ICgpID0+IFQpOiBUIHtcclxuICAgICAgICAgICAgbGV0IGtleTogc3RyaW5nID0gX1QubmFtZTtcclxuICAgICAgICAgICAgbGV0IGluc3RhbmNlczogT2JqZWN0W10gPSBSZWN5Y2xlci5kZXBvdFtrZXldO1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2VzICYmIGluc3RhbmNlcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxUPmluc3RhbmNlcy5wb3AoKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBfVCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcmVzIHRoZSBvYmplY3QgaW4gdGhlIGRlcG90IGZvciBsYXRlciByZWN5Y2xpbmcuIFVzZXJzIGFyZSByZXNwb25zaWJsZSBmb3IgdGhyb3dpbmcgaW4gb2JqZWN0cyB0aGF0IGFyZSBhYm91dCB0byBsb29zZSBzY29wZSBhbmQgYXJlIG5vdCByZWZlcmVuY2VkIGJ5IGFueSBvdGhlclxyXG4gICAgICAgICAqIEBwYXJhbSBfaW5zdGFuY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0b3JlKF9pbnN0YW5jZTogT2JqZWN0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBrZXk6IHN0cmluZyA9IF9pbnN0YW5jZS5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgICAgICAvL0RlYnVnLmxvZyhrZXkpO1xyXG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VzOiBPYmplY3RbXSA9IFJlY3ljbGVyLmRlcG90W2tleV0gfHwgW107XHJcbiAgICAgICAgICAgIGluc3RhbmNlcy5wdXNoKF9pbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIFJlY3ljbGVyLmRlcG90W2tleV0gPSBpbnN0YW5jZXM7XHJcbiAgICAgICAgICAgIC8vIERlYnVnLmxvZyhgT2JqZWN0TWFuYWdlci5kZXBvdFske2tleX1dOiAke09iamVjdE1hbmFnZXIuZGVwb3Rba2V5XS5sZW5ndGh9YCk7XHJcbiAgICAgICAgICAgIC8vRGVidWcubG9nKHRoaXMuZGVwb3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRW1wdHlzIHRoZSBkZXBvdCBvZiBhIGdpdmVuIHR5cGUsIGxlYXZpbmcgdGhlIG9iamVjdHMgZm9yIHRoZSBnYXJiYWdlIGNvbGxlY3Rvci4gTWF5IHJlc3VsdCBpbiBhIHNob3J0IHN0YWxsIHdoZW4gbWFueSBvYmplY3RzIHdlcmUgaW5cclxuICAgICAgICAgKiBAcGFyYW0gX1RcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGR1bXA8VD4oX1Q6IG5ldyAoKSA9PiBUKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBrZXk6IHN0cmluZyA9IF9ULm5hbWU7XHJcbiAgICAgICAgICAgIFJlY3ljbGVyLmRlcG90W2tleV0gPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEVtcHR5cyBhbGwgZGVwb3RzLCBsZWF2aW5nIGFsbCBvYmplY3RzIHRvIHRoZSBnYXJiYWdlIGNvbGxlY3Rvci4gTWF5IHJlc3VsdCBpbiBhIHNob3J0IHN0YWxsIHdoZW4gbWFueSBvYmplY3RzIHdlcmUgaW5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGR1bXBBbGwoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlY3ljbGVyLmRlcG90ID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6YWJsZVJlc291cmNlIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcclxuICAgICAgICBpZFJlc291cmNlOiBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZXNvdXJjZXMge1xyXG4gICAgICAgIFtpZFJlc291cmNlOiBzdHJpbmddOiBTZXJpYWxpemFibGVSZXNvdXJjZTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6YXRpb25PZlJlc291cmNlcyB7XHJcbiAgICAgICAgW2lkUmVzb3VyY2U6IHN0cmluZ106IFNlcmlhbGl6YXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGF0aWMgY2xhc3MgaGFuZGxpbmcgdGhlIHJlc291cmNlcyB1c2VkIHdpdGggdGhlIGN1cnJlbnQgRlVER0UtaW5zdGFuY2UuICBcclxuICAgICAqIEtlZXBzIGEgbGlzdCBvZiB0aGUgcmVzb3VyY2VzIGFuZCBnZW5lcmF0ZXMgaWRzIHRvIHJldHJpZXZlIHRoZW0uICBcclxuICAgICAqIFJlc291cmNlcyBhcmUgb2JqZWN0cyByZWZlcmVuY2VkIG11bHRpcGxlIHRpbWVzIGJ1dCBzdXBwb3NlZCB0byBiZSBzdG9yZWQgb25seSBvbmNlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZXNvdXJjZU1hbmFnZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVzb3VyY2VzOiBSZXNvdXJjZXMgPSB7fTtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb25PZlJlc291cmNlcyA9IG51bGw7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdlbmVyYXRlcyBhbiBpZCBmb3IgdGhlIHJlc291cmNlcyBhbmQgcmVnaXN0ZXJzIGl0IHdpdGggdGhlIGxpc3Qgb2YgcmVzb3VyY2VzIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVzb3VyY2UgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZWdpc3RlcihfcmVzb3VyY2U6IFNlcmlhbGl6YWJsZVJlc291cmNlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICghX3Jlc291cmNlLmlkUmVzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICBfcmVzb3VyY2UuaWRSZXNvdXJjZSA9IFJlc291cmNlTWFuYWdlci5nZW5lcmF0ZUlkKF9yZXNvdXJjZSk7XHJcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNbX3Jlc291cmNlLmlkUmVzb3VyY2VdID0gX3Jlc291cmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2VuZXJhdGUgYSB1c2VyIHJlYWRhYmxlIGFuZCB1bmlxdWUgaWQgdXNpbmcgdGhlIHR5cGUgb2YgdGhlIHJlc291cmNlLCB0aGUgZGF0ZSBhbmQgcmFuZG9tIG51bWJlcnNcclxuICAgICAgICAgKiBAcGFyYW0gX3Jlc291cmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZW5lcmF0ZUlkKF9yZXNvdXJjZTogU2VyaWFsaXphYmxlUmVzb3VyY2UpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBidWlsZCBpZCBhbmQgaW50ZWdyYXRlIGluZm8gZnJvbSByZXNvdXJjZSwgbm90IGp1c3QgZGF0ZVxyXG4gICAgICAgICAgICBsZXQgaWRSZXNvdXJjZTogc3RyaW5nO1xyXG4gICAgICAgICAgICBkb1xyXG4gICAgICAgICAgICAgICAgaWRSZXNvdXJjZSA9IF9yZXNvdXJjZS5jb25zdHJ1Y3Rvci5uYW1lICsgXCJ8XCIgKyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgKyBcInxcIiArIE1hdGgucmFuZG9tKCkudG9QcmVjaXNpb24oNSkuc3Vic3RyKDIsIDUpO1xyXG4gICAgICAgICAgICB3aGlsZSAoUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc1tpZFJlc291cmNlXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpZFJlc291cmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGVzdHMsIGlmIGFuIG9iamVjdCBpcyBhIFtbU2VyaWFsaXphYmxlUmVzb3VyY2VdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfb2JqZWN0IFRoZSBvYmplY3QgdG8gZXhhbWluZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaXNSZXNvdXJjZShfb2JqZWN0OiBTZXJpYWxpemFibGUpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIChSZWZsZWN0Lmhhcyhfb2JqZWN0LCBcImlkUmVzb3VyY2VcIikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzIHRoZSByZXNvdXJjZSBzdG9yZWQgd2l0aCB0aGUgZ2l2ZW4gaWRcclxuICAgICAgICAgKiBAcGFyYW0gX2lkUmVzb3VyY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldChfaWRSZXNvdXJjZTogc3RyaW5nKTogU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgICAgICBsZXQgcmVzb3VyY2U6IFNlcmlhbGl6YWJsZVJlc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc1tfaWRSZXNvdXJjZV07XHJcbiAgICAgICAgICAgIGlmICghcmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gUmVzb3VyY2VNYW5hZ2VyLnNlcmlhbGl6YXRpb25bX2lkUmVzb3VyY2VdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZXJpYWxpemF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGVidWcuZXJyb3IoXCJSZXNvdXJjZSBub3QgZm91bmRcIiwgX2lkUmVzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIuZGVzZXJpYWxpemVSZXNvdXJjZShzZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzb3VyY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuZCByZWdpc3RlcnMgYSByZXNvdXJjZSBmcm9tIGEgW1tOb2RlXV0sIGNvcHlpbmcgdGhlIGNvbXBsZXRlIGJyYW5jaCBzdGFydGluZyB3aXRoIGl0XHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIEEgbm9kZSB0byBjcmVhdGUgdGhlIHJlc291cmNlIGZyb21cclxuICAgICAgICAgKiBAcGFyYW0gX3JlcGxhY2VXaXRoSW5zdGFuY2UgaWYgdHJ1ZSAoZGVmYXVsdCksIHRoZSBub2RlIHVzZWQgYXMgb3JpZ2luIGlzIHJlcGxhY2VkIGJ5IGEgW1tOb2RlUmVzb3VyY2VJbnN0YW5jZV1dIG9mIHRoZSBbW05vZGVSZXNvdXJjZV1dIGNyZWF0ZWRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyTm9kZUFzUmVzb3VyY2UoX25vZGU6IE5vZGUsIF9yZXBsYWNlV2l0aEluc3RhbmNlOiBib29sZWFuID0gdHJ1ZSk6IE5vZGVSZXNvdXJjZSB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gX25vZGUuc2VyaWFsaXplKCk7XHJcbiAgICAgICAgICAgIGxldCBub2RlUmVzb3VyY2U6IE5vZGVSZXNvdXJjZSA9IG5ldyBOb2RlUmVzb3VyY2UoXCJOb2RlUmVzb3VyY2VcIik7XHJcbiAgICAgICAgICAgIG5vZGVSZXNvdXJjZS5kZXNlcmlhbGl6ZShzZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnJlZ2lzdGVyKG5vZGVSZXNvdXJjZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoX3JlcGxhY2VXaXRoSW5zdGFuY2UgJiYgX25vZGUuZ2V0UGFyZW50KCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbnN0YW5jZTogTm9kZVJlc291cmNlSW5zdGFuY2UgPSBuZXcgTm9kZVJlc291cmNlSW5zdGFuY2Uobm9kZVJlc291cmNlKTtcclxuICAgICAgICAgICAgICAgIF9ub2RlLmdldFBhcmVudCgpLnJlcGxhY2VDaGlsZChfbm9kZSwgaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZVJlc291cmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VyaWFsaXplIGFsbCByZXNvdXJjZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbk9mUmVzb3VyY2VzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkUmVzb3VyY2UgaW4gUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlc291cmNlOiBTZXJpYWxpemFibGVSZXNvdXJjZSA9IFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNbaWRSZXNvdXJjZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoaWRSZXNvdXJjZSAhPSByZXNvdXJjZS5pZFJlc291cmNlKVxyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKFwiUmVzb3VyY2UtaWQgbWlzbWF0Y2hcIiwgcmVzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbltpZFJlc291cmNlXSA9IFNlcmlhbGl6ZXIuc2VyaWFsaXplKHJlc291cmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZSByZXNvdXJjZXMgZnJvbSBhIHNlcmlhbGl6YXRpb24sIGRlbGV0aW5nIGFsbCByZXNvdXJjZXMgcHJldmlvdXNseSByZWdpc3RlcmVkXHJcbiAgICAgICAgICogQHBhcmFtIF9zZXJpYWxpemF0aW9uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb25PZlJlc291cmNlcyk6IFJlc291cmNlcyB7XHJcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5zZXJpYWxpemF0aW9uID0gX3NlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXMgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaWRSZXNvdXJjZSBpbiBfc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBfc2VyaWFsaXphdGlvbltpZFJlc291cmNlXTtcclxuICAgICAgICAgICAgICAgIGxldCByZXNvdXJjZTogU2VyaWFsaXphYmxlUmVzb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIuZGVzZXJpYWxpemVSZXNvdXJjZShzZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZSlcclxuICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzW2lkUmVzb3VyY2VdID0gcmVzb3VyY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkZXNlcmlhbGl6ZVJlc291cmNlKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gPFNlcmlhbGl6YWJsZVJlc291cmNlPlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIGRpZmZlcmVudCBraW5kcyBvZiBsaWdodHMuIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpZ2h0IGV4dGVuZHMgTXV0YWJsZSB7XHJcbiAgICAgICAgcHVibGljIGNvbG9yOiBDb2xvcjtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3IgPSBfY29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKCk6IHZvaWQgey8qKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW1iaWVudCBsaWdodCwgY29taW5nIGZyb20gYWxsIGRpcmVjdGlvbnMsIGlsbHVtaW5hdGluZyBldmVyeXRoaW5nIHdpdGggaXRzIGNvbG9yIGluZGVwZW5kZW50IG9mIHBvc2l0aW9uIGFuZCBvcmllbnRhdGlvbiAobGlrZSBhIGZvZ2d5IGRheSBvciBpbiB0aGUgc2hhZGVzKSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIH4gfiB+ICBcclxuICAgICAqICB+IH4gfiAgXHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIExpZ2h0QW1iaWVudCBleHRlbmRzIExpZ2h0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKF9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXJlY3Rpb25hbCBsaWdodCwgaWxsdW1pbmF0aW5nIGV2ZXJ5dGhpbmcgZnJvbSBhIHNwZWNpZmllZCBkaXJlY3Rpb24gd2l0aCBpdHMgY29sb3IgKGxpa2Ugc3RhbmRpbmcgaW4gYnJpZ2h0IHN1bmxpZ2h0KSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIC0tLT4gIFxyXG4gICAgICogLS0tPiAgXHJcbiAgICAgKiAtLS0+ICBcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTGlnaHREaXJlY3Rpb25hbCBleHRlbmRzIExpZ2h0IHtcclxuICAgICAgICBwdWJsaWMgZGlyZWN0aW9uOiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoMCwgLTEsIDApO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9jb2xvcjogQ29sb3IgPSBuZXcgQ29sb3IoMSwgMSwgMSwgMSksIF9kaXJlY3Rpb246IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAtMSwgMCkpIHtcclxuICAgICAgICAgICAgc3VwZXIoX2NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfZGlyZWN0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogT21uaWRpcmVjdGlvbmFsIGxpZ2h0IGVtaXR0aW5nIGZyb20gaXRzIHBvc2l0aW9uLCBpbGx1bWluYXRpbmcgb2JqZWN0cyBkZXBlbmRpbmcgb24gdGhlaXIgcG9zaXRpb24gYW5kIGRpc3RhbmNlIHdpdGggaXRzIGNvbG9yIChsaWtlIGEgY29sb3JlZCBsaWdodCBidWxiKSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgLlxcfC8uXHJcbiAgICAgKiAgICAgICAgLS0gbyAtLVxyXG4gICAgICogICAgICAgICDCtC98XFxgXHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIExpZ2h0UG9pbnQgZXh0ZW5kcyBMaWdodCB7XHJcbiAgICAgICAgcHVibGljIHJhbmdlOiBudW1iZXIgPSAxMDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU3BvdCBsaWdodCBlbWl0dGluZyB3aXRoaW4gYSBzcGVjaWZpZWQgYW5nbGUgZnJvbSBpdHMgcG9zaXRpb24sIGlsbHVtaW5hdGluZyBvYmplY3RzIGRlcGVuZGluZyBvbiB0aGVpciBwb3NpdGlvbiBhbmQgZGlzdGFuY2Ugd2l0aCBpdHMgY29sb3IgIFxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICBvICBcclxuICAgICAqICAgICAgICAgL3xcXCAgXHJcbiAgICAgKiAgICAgICAgLyB8IFxcIFxyXG4gICAgICogYGBgICAgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBMaWdodFNwb3QgZXh0ZW5kcyBMaWdodCB7XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTGlnaHQvTGlnaHQudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Db21wb25lbnQvQ29tcG9uZW50TGlnaHQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IHR5cGUgTWFwTGlnaHRUeXBlVG9MaWdodExpc3QgPSBNYXA8c3RyaW5nLCBDb21wb25lbnRMaWdodFtdPjtcclxuICAgIC8qKlxyXG4gICAgICogQ29udHJvbHMgdGhlIHJlbmRlcmluZyBvZiBhIGJyYW5jaCBvZiBhIHNjZW5ldHJlZSwgdXNpbmcgdGhlIGdpdmVuIFtbQ29tcG9uZW50Q2FtZXJhXV0sXHJcbiAgICAgKiBhbmQgdGhlIHByb3BhZ2F0aW9uIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBmcm9tIHRoZSBvZmZzY3JlZW4gcmVuZGVyYnVmZmVyIHRvIHRoZSB0YXJnZXQgY2FudmFzXHJcbiAgICAgKiB0aHJvdWdoIGEgc2VyaWVzIG9mIFtbRnJhbWluZ11dIG9iamVjdHMuIFRoZSBzdGFnZXMgaW52b2x2ZWQgYXJlIGluIG9yZGVyIG9mIHJlbmRlcmluZ1xyXG4gICAgICogW1tSZW5kZXJNYW5hZ2VyXV0udmlld3BvcnQgLT4gW1tWaWV3cG9ydF1dLnNvdXJjZSAtPiBbW1ZpZXdwb3J0XV0uZGVzdGluYXRpb24gLT4gRE9NLUNhbnZhcyAtPiBDbGllbnQoQ1NTKVxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVmlld3BvcnQgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZm9jdXM6IFZpZXdwb3J0O1xyXG5cclxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nID0gXCJWaWV3cG9ydFwiOyAvLyBUaGUgbmFtZSB0byBjYWxsIHRoaXMgdmlld3BvcnQgYnkuXHJcbiAgICAgICAgcHVibGljIGNhbWVyYTogQ29tcG9uZW50Q2FtZXJhID0gbnVsbDsgLy8gVGhlIGNhbWVyYSByZXByZXNlbnRpbmcgdGhlIHZpZXcgcGFyYW1ldGVycyB0byByZW5kZXIgdGhlIGJyYW5jaC5cclxuXHJcbiAgICAgICAgcHVibGljIHJlY3RTb3VyY2U6IFJlY3RhbmdsZTtcclxuICAgICAgICBwdWJsaWMgcmVjdERlc3RpbmF0aW9uOiBSZWN0YW5nbGU7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHZlcmlmeSBpZiBjbGllbnQgdG8gY2FudmFzIHNob3VsZCBiZSBpbiBWaWV3cG9ydCBvciBzb21ld2hlcmUgZWxzZSAoV2luZG93LCBDb250YWluZXI/KVxyXG4gICAgICAgIC8vIE11bHRpcGxlIHZpZXdwb3J0cyB1c2luZyB0aGUgc2FtZSBjYW52YXMgc2hvdWxkbid0IGRpZmZlciBoZXJlLi4uXHJcbiAgICAgICAgLy8gZGlmZmVyZW50IGZyYW1pbmcgbWV0aG9kcyBjYW4gYmUgdXNlZCwgdGhpcyBpcyB0aGUgZGVmYXVsdFxyXG4gICAgICAgIHB1YmxpYyBmcmFtZUNsaWVudFRvQ2FudmFzOiBGcmFtaW5nU2NhbGVkID0gbmV3IEZyYW1pbmdTY2FsZWQoKTtcclxuICAgICAgICBwdWJsaWMgZnJhbWVDYW52YXNUb0Rlc3RpbmF0aW9uOiBGcmFtaW5nQ29tcGxleCA9IG5ldyBGcmFtaW5nQ29tcGxleCgpO1xyXG4gICAgICAgIHB1YmxpYyBmcmFtZURlc3RpbmF0aW9uVG9Tb3VyY2U6IEZyYW1pbmdTY2FsZWQgPSBuZXcgRnJhbWluZ1NjYWxlZCgpO1xyXG4gICAgICAgIHB1YmxpYyBmcmFtZVNvdXJjZVRvUmVuZGVyOiBGcmFtaW5nU2NhbGVkID0gbmV3IEZyYW1pbmdTY2FsZWQoKTtcclxuXHJcbiAgICAgICAgcHVibGljIGFkanVzdGluZ0ZyYW1lczogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHVibGljIGFkanVzdGluZ0NhbWVyYTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBsaWdodHM6IE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBicmFuY2g6IE5vZGUgPSBudWxsOyAvLyBUaGUgZmlyc3Qgbm9kZSBpbiB0aGUgdHJlZShicmFuY2gpIHRoYXQgd2lsbCBiZSByZW5kZXJlZC5cclxuICAgICAgICBwcml2YXRlIGNyYzI6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIHBpY2tCdWZmZXJzOiBQaWNrQnVmZmVyW10gPSBbXTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29ubmVjdHMgdGhlIHZpZXdwb3J0IHRvIHRoZSBnaXZlbiBjYW52YXMgdG8gcmVuZGVyIHRoZSBnaXZlbiBicmFuY2ggdG8gdXNpbmcgdGhlIGdpdmVuIGNhbWVyYS1jb21wb25lbnQsIGFuZCBuYW1lcyB0aGUgdmlld3BvcnQgYXMgZ2l2ZW4uXHJcbiAgICAgICAgICogQHBhcmFtIF9uYW1lIFxyXG4gICAgICAgICAqIEBwYXJhbSBfYnJhbmNoIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FtZXJhIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FudmFzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbml0aWFsaXplKF9uYW1lOiBzdHJpbmcsIF9icmFuY2g6IE5vZGUsIF9jYW1lcmE6IENvbXBvbmVudENhbWVyYSwgX2NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gX25hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhID0gX2NhbWVyYTtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBfY2FudmFzO1xyXG4gICAgICAgICAgICB0aGlzLmNyYzIgPSBfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVjdFNvdXJjZSA9IFJlbmRlck1hbmFnZXIuZ2V0Q2FudmFzUmVjdCgpO1xyXG4gICAgICAgICAgICB0aGlzLnJlY3REZXN0aW5hdGlvbiA9IHRoaXMuZ2V0Q2xpZW50UmVjdGFuZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldEJyYW5jaChfYnJhbmNoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmUgdGhlIDJELWNvbnRleHQgYXR0YWNoZWQgdG8gdGhlIGRlc3RpbmF0aW9uIGNhbnZhc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDb250ZXh0KCk6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyYzI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlIHRoZSBzaXplIG9mIHRoZSBkZXN0aW5hdGlvbiBjYW52YXMgYXMgYSByZWN0YW5nbGUsIHggYW5kIHkgYXJlIGFsd2F5cyAwIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDYW52YXNSZWN0YW5nbGUoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlIHRoZSBjbGllbnQgcmVjdGFuZ2xlIHRoZSBjYW52YXMgaXMgZGlzcGxheWVkIGFuZCBmaXQgaW4sIHggYW5kIHkgYXJlIGFsd2F5cyAwIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDbGllbnRSZWN0YW5nbGUoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGhpcy5jYW52YXMuY2xpZW50V2lkdGgsIHRoaXMuY2FudmFzLmNsaWVudEhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgdGhlIGJyYW5jaCB0byBiZSBkcmF3biBpbiB0aGUgdmlld3BvcnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldEJyYW5jaChfYnJhbmNoOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJyYW5jaCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5icmFuY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcihFVkVOVC5DT01QT05FTlRfQURELCB0aGlzLmhuZENvbXBvbmVudEV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnJhbmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX1JFTU9WRSwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5icmFuY2ggPSBfYnJhbmNoO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RMaWdodHMoKTtcclxuICAgICAgICAgICAgdGhpcy5icmFuY2guYWRkRXZlbnRMaXN0ZW5lcihFVkVOVC5DT01QT05FTlRfQURELCB0aGlzLmhuZENvbXBvbmVudEV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5icmFuY2guYWRkRXZlbnRMaXN0ZW5lcihFVkVOVC5DT01QT05FTlRfUkVNT1ZFLCB0aGlzLmhuZENvbXBvbmVudEV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTG9ncyB0aGlzIHZpZXdwb3J0cyBzY2VuZWdyYXBoIHRvIHRoZSBjb25zb2xlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzaG93U2NlbmVHcmFwaCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogbW92ZSB0byBkZWJ1Zy1jbGFzc1xyXG4gICAgICAgICAgICBsZXQgb3V0cHV0OiBzdHJpbmcgPSBcIlNjZW5lR3JhcGggZm9yIHRoaXMgdmlld3BvcnQ6XCI7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSBcIlxcbiBcXG5cIjtcclxuICAgICAgICAgICAgb3V0cHV0ICs9IHRoaXMuYnJhbmNoLm5hbWU7XHJcbiAgICAgICAgICAgIERlYnVnLmxvZyhvdXRwdXQgKyBcIiAgID0+IFJPT1ROT0RFXCIgKyB0aGlzLmNyZWF0ZVNjZW5lR3JhcGgodGhpcy5icmFuY2gpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gRHJhd2luZ1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXcgdGhpcyB2aWV3cG9ydFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBkcmF3KCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlc2V0RnJhbWVCdWZmZXIoKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNhbWVyYS5pc0FjdGl2ZSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nRnJhbWVzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RGcmFtZXMoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nQ2FtZXJhKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RDYW1lcmEoKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY2xlYXIodGhpcy5jYW1lcmEuZ2V0QmFja2dvdW5kQ29sb3IoKSk7XHJcbiAgICAgICAgICAgIGlmIChSZW5kZXJNYW5hZ2VyLmFkZEJyYW5jaCh0aGlzLmJyYW5jaCkpXHJcbiAgICAgICAgICAgICAgICAvLyBicmFuY2ggaGFzIG5vdCB5ZXQgYmVlbiBwcm9jZXNzZWQgZnVsbHkgYnkgcmVuZGVybWFuYWdlciAtPiB1cGRhdGUgYWxsIHJlZ2lzdGVyZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuc2V0TGlnaHRzKHRoaXMubGlnaHRzKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5kcmF3QnJhbmNoKHRoaXMuYnJhbmNoLCB0aGlzLmNhbWVyYSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyYzIuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3JjMi5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmdldENhbnZhcygpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlLngsIHRoaXMucmVjdFNvdXJjZS55LCB0aGlzLnJlY3RTb3VyY2Uud2lkdGgsIHRoaXMucmVjdFNvdXJjZS5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3REZXN0aW5hdGlvbi54LCB0aGlzLnJlY3REZXN0aW5hdGlvbi55LCB0aGlzLnJlY3REZXN0aW5hdGlvbi53aWR0aCwgdGhpcy5yZWN0RGVzdGluYXRpb24uaGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIERyYXcgdGhpcyB2aWV3cG9ydCBmb3IgUmF5Q2FzdFxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZVBpY2tCdWZmZXJzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hZGp1c3RpbmdGcmFtZXMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkanVzdEZyYW1lcygpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hZGp1c3RpbmdDYW1lcmEpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkanVzdENhbWVyYSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKFJlbmRlck1hbmFnZXIuYWRkQnJhbmNoKHRoaXMuYnJhbmNoKSlcclxuICAgICAgICAgICAgICAgIC8vIGJyYW5jaCBoYXMgbm90IHlldCBiZWVuIHByb2Nlc3NlZCBmdWxseSBieSByZW5kZXJtYW5hZ2VyIC0+IHVwZGF0ZSBhbGwgcmVnaXN0ZXJlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGlja0J1ZmZlcnMgPSBSZW5kZXJNYW5hZ2VyLmRyYXdCcmFuY2hGb3JSYXlDYXN0KHRoaXMuYnJhbmNoLCB0aGlzLmNhbWVyYSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyYzIuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3JjMi5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmdldENhbnZhcygpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlLngsIHRoaXMucmVjdFNvdXJjZS55LCB0aGlzLnJlY3RTb3VyY2Uud2lkdGgsIHRoaXMucmVjdFNvdXJjZS5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3REZXN0aW5hdGlvbi54LCB0aGlzLnJlY3REZXN0aW5hdGlvbi55LCB0aGlzLnJlY3REZXN0aW5hdGlvbi53aWR0aCwgdGhpcy5yZWN0RGVzdGluYXRpb24uaGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHBpY2tOb2RlQXQoX3BvczogVmVjdG9yMik6IFJheUhpdFtdIHtcclxuICAgICAgICAgICAgLy8gdGhpcy5jcmVhdGVQaWNrQnVmZmVycygpO1xyXG4gICAgICAgICAgICBsZXQgaGl0czogUmF5SGl0W10gPSBSZW5kZXJNYW5hZ2VyLnBpY2tOb2RlQXQoX3BvcywgdGhpcy5waWNrQnVmZmVycywgdGhpcy5yZWN0U291cmNlKTtcclxuICAgICAgICAgICAgaGl0cy5zb3J0KChhOiBSYXlIaXQsIGI6IFJheUhpdCkgPT4gKGIuekJ1ZmZlciA+IDApID8gKGEuekJ1ZmZlciA+IDApID8gYS56QnVmZmVyIC0gYi56QnVmZmVyIDogMSA6IC0xKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhpdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGp1c3QgYWxsIGZyYW1lcyBpbnZvbHZlZCBpbiB0aGUgcmVuZGVyaW5nIHByb2Nlc3MgZnJvbSB0aGUgZGlzcGxheSBhcmVhIGluIHRoZSBjbGllbnQgdXAgdG8gdGhlIHJlbmRlcmVyIGNhbnZhc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RGcmFtZXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIGdldCB0aGUgcmVjdGFuZ2xlIG9mIHRoZSBjYW52YXMgYXJlYSBhcyBkaXNwbGF5ZWQgKGNvbnNpZGVyIGNzcylcclxuICAgICAgICAgICAgbGV0IHJlY3RDbGllbnQ6IFJlY3RhbmdsZSA9IHRoaXMuZ2V0Q2xpZW50UmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIC8vIGFkanVzdCB0aGUgY2FudmFzIHNpemUgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmcmFtaW5nIGFwcGxpZWQgdG8gY2xpZW50XHJcbiAgICAgICAgICAgIGxldCByZWN0Q2FudmFzOiBSZWN0YW5nbGUgPSB0aGlzLmZyYW1lQ2xpZW50VG9DYW52YXMuZ2V0UmVjdChyZWN0Q2xpZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSByZWN0Q2FudmFzLndpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSByZWN0Q2FudmFzLmhlaWdodDtcclxuICAgICAgICAgICAgLy8gYWRqdXN0IHRoZSBkZXN0aW5hdGlvbiBhcmVhIG9uIHRoZSB0YXJnZXQtY2FudmFzIHRvIHJlbmRlciB0byBieSBhcHBseWluZyB0aGUgZnJhbWluZyB0byBjYW52YXNcclxuICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24gPSB0aGlzLmZyYW1lQ2FudmFzVG9EZXN0aW5hdGlvbi5nZXRSZWN0KHJlY3RDYW52YXMpO1xyXG4gICAgICAgICAgICAvLyBhZGp1c3QgdGhlIGFyZWEgb24gdGhlIHNvdXJjZS1jYW52YXMgdG8gcmVuZGVyIGZyb20gYnkgYXBwbHlpbmcgdGhlIGZyYW1pbmcgdG8gZGVzdGluYXRpb24gYXJlYVxyXG4gICAgICAgICAgICB0aGlzLnJlY3RTb3VyY2UgPSB0aGlzLmZyYW1lRGVzdGluYXRpb25Ub1NvdXJjZS5nZXRSZWN0KHRoaXMucmVjdERlc3RpbmF0aW9uKTtcclxuICAgICAgICAgICAgLy8gaGF2aW5nIGFuIG9mZnNldCBzb3VyY2UgZG9lcyBtYWtlIHNlbnNlIG9ubHkgd2hlbiBtdWx0aXBsZSB2aWV3cG9ydHMgZGlzcGxheSBwYXJ0cyBvZiB0aGUgc2FtZSByZW5kZXJpbmcuIEZvciBub3c6IHNoaWZ0IGl0IHRvIDAsMFxyXG4gICAgICAgICAgICB0aGlzLnJlY3RTb3VyY2UueCA9IHRoaXMucmVjdFNvdXJjZS55ID0gMDtcclxuICAgICAgICAgICAgLy8gc3RpbGwsIGEgcGFydGlhbCBpbWFnZSBvZiB0aGUgcmVuZGVyaW5nIG1heSBiZSByZXRyaWV2ZWQgYnkgbW92aW5nIGFuZCByZXNpemluZyB0aGUgcmVuZGVyIHZpZXdwb3J0XHJcbiAgICAgICAgICAgIGxldCByZWN0UmVuZGVyOiBSZWN0YW5nbGUgPSB0aGlzLmZyYW1lU291cmNlVG9SZW5kZXIuZ2V0UmVjdCh0aGlzLnJlY3RTb3VyY2UpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnNldFZpZXdwb3J0UmVjdGFuZ2xlKHJlY3RSZW5kZXIpO1xyXG4gICAgICAgICAgICAvLyBubyBtb3JlIHRyYW5zZm9ybWF0aW9uIGFmdGVyIHRoaXMgZm9yIG5vdywgb2Zmc2NyZWVuIGNhbnZhcyBhbmQgcmVuZGVyLXZpZXdwb3J0IGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnNldENhbnZhc1NpemUocmVjdFJlbmRlci53aWR0aCwgcmVjdFJlbmRlci5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGp1c3QgdGhlIGNhbWVyYSBwYXJhbWV0ZXJzIHRvIGZpdCB0aGUgcmVuZGVyaW5nIGludG8gdGhlIHJlbmRlciB2aWVwb3J0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFkanVzdENhbWVyYSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHJlY3Q6IFJlY3RhbmdsZSA9IFJlbmRlck1hbmFnZXIuZ2V0Vmlld3BvcnRSZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEucHJvamVjdENlbnRyYWwocmVjdC53aWR0aCAvIHJlY3QuaGVpZ2h0LCB0aGlzLmNhbWVyYS5nZXRGaWVsZE9mVmlldygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyNyZWdpb24gUG9pbnRzXHJcbiAgICAgICAgcHVibGljIHBvaW50Q2xpZW50VG9Tb3VyY2UoX2NsaWVudDogVmVjdG9yMik6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyO1xyXG4gICAgICAgICAgICBsZXQgcmVjdDogUmVjdGFuZ2xlO1xyXG4gICAgICAgICAgICByZWN0ID0gdGhpcy5nZXRDbGllbnRSZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5mcmFtZUNsaWVudFRvQ2FudmFzLmdldFBvaW50KF9jbGllbnQsIHJlY3QpO1xyXG4gICAgICAgICAgICByZWN0ID0gdGhpcy5nZXRDYW52YXNSZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5mcmFtZUNhbnZhc1RvRGVzdGluYXRpb24uZ2V0UG9pbnQocmVzdWx0LCByZWN0KTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5mcmFtZURlc3RpbmF0aW9uVG9Tb3VyY2UuZ2V0UG9pbnQocmVzdWx0LCB0aGlzLnJlY3RTb3VyY2UpO1xyXG4gICAgICAgICAgICAvL1RPRE86IHdoZW4gU291cmNlLCBSZW5kZXIgYW5kIFJlbmRlclZpZXdwb3J0IGRldmlhdGUsIGNvbnRpbnVlIHRyYW5zZm9ybWF0aW9uIFxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHBvaW50U291cmNlVG9SZW5kZXIoX3NvdXJjZTogVmVjdG9yMik6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcHJvamVjdGlvblJlY3RhbmdsZTogUmVjdGFuZ2xlID0gdGhpcy5jYW1lcmEuZ2V0UHJvamVjdGlvblJlY3RhbmdsZSgpO1xyXG4gICAgICAgICAgICBsZXQgcG9pbnQ6IFZlY3RvcjIgPSB0aGlzLmZyYW1lU291cmNlVG9SZW5kZXIuZ2V0UG9pbnQoX3NvdXJjZSwgcHJvamVjdGlvblJlY3RhbmdsZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwb2ludDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBwb2ludENsaWVudFRvUmVuZGVyKF9jbGllbnQ6IFZlY3RvcjIpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHBvaW50OiBWZWN0b3IyID0gdGhpcy5wb2ludENsaWVudFRvU291cmNlKF9jbGllbnQpO1xyXG4gICAgICAgICAgICBwb2ludCA9IHRoaXMucG9pbnRTb3VyY2VUb1JlbmRlcihwb2ludCk7XHJcbiAgICAgICAgICAgIC8vVE9ETzogd2hlbiBSZW5kZXIgYW5kIFJlbmRlclZpZXdwb3J0IGRldmlhdGUsIGNvbnRpbnVlIHRyYW5zZm9ybWF0aW9uIFxyXG4gICAgICAgICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBFdmVudHMgKHBhc3NpbmcgZnJvbSBjYW52YXMgdG8gdmlld3BvcnQgYW5kIGZyb20gdGhlcmUgaW50byBicmFuY2gpXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgdmlld3BvcnQgY3VycmVudGx5IGhhcyBmb2N1cyBhbmQgdGh1cyByZWNlaXZlcyBrZXlib2FyZCBldmVudHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IGhhc0ZvY3VzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKFZpZXdwb3J0LmZvY3VzID09IHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTd2l0Y2ggdGhlIHZpZXdwb3J0cyBmb2N1cyBvbiBvciBvZmYuIE9ubHkgb25lIHZpZXdwb3J0IGluIG9uZSBGVURHRSBpbnN0YW5jZSBjYW4gaGF2ZSB0aGUgZm9jdXMsIHRodXMgcmVjZWl2aW5nIGtleWJvYXJkIGV2ZW50cy4gXHJcbiAgICAgICAgICogU28gYSB2aWV3cG9ydCBjdXJyZW50bHkgaGF2aW5nIHRoZSBmb2N1cyB3aWxsIGxvc2UgaXQsIHdoZW4gYW5vdGhlciBvbmUgcmVjZWl2ZXMgaXQuIFRoZSB2aWV3cG9ydHMgZmlyZSBbW0V2ZW50XV1zIGFjY29yZGluZ2x5LlxyXG4gICAgICAgICAqICBcclxuICAgICAgICAgKiBAcGFyYW0gX29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRGb2N1cyhfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKF9vbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpZXdwb3J0LmZvY3VzID09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpZXdwb3J0LmZvY3VzKVxyXG4gICAgICAgICAgICAgICAgICAgIFZpZXdwb3J0LmZvY3VzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkZPQ1VTX09VVCkpO1xyXG4gICAgICAgICAgICAgICAgVmlld3BvcnQuZm9jdXMgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5GT0NVU19JTikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpZXdwb3J0LmZvY3VzICE9IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuRk9DVVNfT1VUKSk7XHJcbiAgICAgICAgICAgICAgICBWaWV3cG9ydC5mb2N1cyA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGUtIC8gQWN0aXZhdGVzIHRoZSBnaXZlbiBwb2ludGVyIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnQgXHJcbiAgICAgICAgICogQHBhcmFtIF90eXBlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFjdGl2YXRlUG9pbnRlckV2ZW50KF90eXBlOiBFVkVOVF9QT0lOVEVSLCBfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUV2ZW50KHRoaXMuY2FudmFzLCBfdHlwZSwgdGhpcy5obmRQb2ludGVyRXZlbnQsIF9vbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlcyB0aGUgZ2l2ZW4ga2V5Ym9hcmQgZXZlbnQgdG8gYmUgcHJvcGFnYXRlZCBpbnRvIHRoZSB2aWV3cG9ydCBhcyBGVURHRS1FdmVudFxyXG4gICAgICAgICAqIEBwYXJhbSBfdHlwZSBcclxuICAgICAgICAgKiBAcGFyYW0gX29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhY3RpdmF0ZUtleWJvYXJkRXZlbnQoX3R5cGU6IEVWRU5UX0tFWUJPQVJELCBfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUV2ZW50KHRoaXMuY2FudmFzLm93bmVyRG9jdW1lbnQsIF90eXBlLCB0aGlzLmhuZEtleWJvYXJkRXZlbnQsIF9vbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlcyB0aGUgZ2l2ZW4gZHJhZy1kcm9wIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX3R5cGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGVEcmFnRHJvcEV2ZW50KF90eXBlOiBFVkVOVF9EUkFHRFJPUCwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfdHlwZSA9PSBFVkVOVF9EUkFHRFJPUC5TVEFSVClcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLmRyYWdnYWJsZSA9IF9vbjtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUV2ZW50KHRoaXMuY2FudmFzLCBfdHlwZSwgdGhpcy5obmREcmFnRHJvcEV2ZW50LCBfb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZS0gLyBBY3RpdmF0ZXMgdGhlIHdoZWVsIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX3R5cGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGVXaGVlbEV2ZW50KF90eXBlOiBFVkVOVF9XSEVFTCwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcywgX3R5cGUsIHRoaXMuaG5kV2hlZWxFdmVudCwgX29uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGFuZGxlIGRyYWctZHJvcCBldmVudHMgYW5kIGRpc3BhdGNoIHRvIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBobmREcmFnRHJvcEV2ZW50OiBFdmVudExpc3RlbmVyID0gKF9ldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IF9kcmFnZXZlbnQ6IERyYWdEcm9wRXZlbnTGkiA9IDxEcmFnRHJvcEV2ZW50xpI+X2V2ZW50O1xyXG4gICAgICAgICAgICBzd2l0Y2ggKF9kcmFnZXZlbnQudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImRyYWdvdmVyXCI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZHJvcFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIF9kcmFnZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZHJhZ3N0YXJ0XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ganVzdCBkdW1teSBkYXRhLCAgdmFsaWQgZGF0YSBzaG91bGQgYmUgc2V0IGluIGhhbmRsZXIgcmVnaXN0ZXJlZCBieSB0aGUgdXNlclxyXG4gICAgICAgICAgICAgICAgICAgIF9kcmFnZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0XCIsIFwiSGFsbG9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgdGhlcmUgaXMgYSBiZXR0ZXIgc29sdXRpb24gdG8gaGlkZSB0aGUgZ2hvc3QgaW1hZ2Ugb2YgdGhlIGRyYWdnYWJsZSBvYmplY3RcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UobmV3IEltYWdlKCksIDAsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBldmVudDogRHJhZ0Ryb3BFdmVudMaSID0gbmV3IERyYWdEcm9wRXZlbnTGkihcIsaSXCIgKyBfZXZlbnQudHlwZSwgX2RyYWdldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2FudmFzUG9zaXRpb24oZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGQgcG9zaXRpb24gb2YgdGhlIHBvaW50ZXIgbWFwcGVkIHRvIGNhbnZhcy1jb29yZGluYXRlcyBhcyBjYW52YXNYLCBjYW52YXNZIHRvIHRoZSBldmVudFxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgYWRkQ2FudmFzUG9zaXRpb24oZXZlbnQ6IFBvaW50ZXJFdmVudMaSIHwgRHJhZ0Ryb3BFdmVudMaSKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGV2ZW50LmNhbnZhc1ggPSB0aGlzLmNhbnZhcy53aWR0aCAqIGV2ZW50LnBvaW50ZXJYIC8gZXZlbnQuY2xpZW50UmVjdC53aWR0aDtcclxuICAgICAgICAgICAgZXZlbnQuY2FudmFzWSA9IHRoaXMuY2FudmFzLmhlaWdodCAqIGV2ZW50LnBvaW50ZXJZIC8gZXZlbnQuY2xpZW50UmVjdC5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSBwb2ludGVyIGV2ZW50cyBhbmQgZGlzcGF0Y2ggdG8gdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGhuZFBvaW50ZXJFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDogUG9pbnRlckV2ZW50xpIgPSBuZXcgUG9pbnRlckV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIDxQb2ludGVyRXZlbnTGkj5fZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZENhbnZhc1Bvc2l0aW9uKGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGFuZGxlIGtleWJvYXJkIGV2ZW50cyBhbmQgZGlzcGF0Y2ggdG8gdmlld3BvcnQgYXMgRlVER0UtRXZlbnQsIGlmIHRoZSB2aWV3cG9ydCBoYXMgdGhlIGZvY3VzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBobmRLZXlib2FyZEV2ZW50OiBFdmVudExpc3RlbmVyID0gKF9ldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0ZvY3VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEtleWJvYXJkRXZlbnTGkiA9IG5ldyBLZXlib2FyZEV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIDxLZXlib2FyZEV2ZW50xpI+X2V2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGFuZGxlIHdoZWVsIGV2ZW50IGFuZCBkaXNwYXRjaCB0byB2aWV3cG9ydCBhcyBGVURHRS1FdmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaG5kV2hlZWxFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDogV2hlZWxFdmVudMaSID0gbmV3IFdoZWVsRXZlbnTGkihcIsaSXCIgKyBfZXZlbnQudHlwZSwgPFdoZWVsRXZlbnTGkj5fZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhY3RpdmF0ZUV2ZW50KF90YXJnZXQ6IEV2ZW50VGFyZ2V0LCBfdHlwZTogc3RyaW5nLCBfaGFuZGxlcjogRXZlbnRMaXN0ZW5lciwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIF90eXBlID0gX3R5cGUuc2xpY2UoMSk7IC8vIGNoaXAgdGhlIMaSbG9yZW50aW5cclxuICAgICAgICAgICAgaWYgKF9vbilcclxuICAgICAgICAgICAgICAgIF90YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihfdHlwZSwgX2hhbmRsZXIpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBfdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoX3R5cGUsIF9oYW5kbGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaG5kQ29tcG9uZW50RXZlbnQoX2V2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5sb2coX2V2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb2xsZWN0IGFsbCBsaWdodHMgaW4gdGhlIGJyYW5jaCB0byBwYXNzIHRvIHNoYWRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGNvbGxlY3RMaWdodHMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IG1ha2UgcHJpdmF0ZVxyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0cyA9IG5ldyBNYXAoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLmJyYW5jaC5icmFuY2gpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjbXBMaWdodHM6IENvbXBvbmVudExpZ2h0W10gPSBub2RlLmdldENvbXBvbmVudHMoQ29tcG9uZW50TGlnaHQpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY21wTGlnaHQgb2YgY21wTGlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHR5cGU6IHN0cmluZyA9IGNtcExpZ2h0LmdldExpZ2h0KCkudHlwZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGlnaHRzT2ZUeXBlOiBDb21wb25lbnRMaWdodFtdID0gdGhpcy5saWdodHMuZ2V0KHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbGlnaHRzT2ZUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpZ2h0c09mVHlwZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZ2h0cy5zZXQodHlwZSwgbGlnaHRzT2ZUeXBlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGlnaHRzT2ZUeXBlLnB1c2goY21wTGlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gb3V0cHV0c3RyaW5nIGFzIHZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHZpZXdwb3J0cyBzY2VuZWdyYXBoLiBDYWxsZWQgZm9yIHRoZSBwYXNzZWQgbm9kZSBhbmQgcmVjdXJzaXZlIGZvciBhbGwgaXRzIGNoaWxkcmVuLlxyXG4gICAgICAgICAqIEBwYXJhbSBfZnVkZ2VOb2RlIFRoZSBub2RlIHRvIGNyZWF0ZSBhIHNjZW5lZ3JhcGhlbnRyeSBmb3IuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVTY2VuZUdyYXBoKF9mdWRnZU5vZGU6IE5vZGUpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBtb3ZlIHRvIGRlYnVnLWNsYXNzXHJcbiAgICAgICAgICAgIGxldCBvdXRwdXQ6IHN0cmluZyA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgaW4gX2Z1ZGdlTm9kZS5nZXRDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQ6IE5vZGUgPSBfZnVkZ2VOb2RlLmdldENoaWxkcmVuKClbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gXCJcXG5cIjtcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50OiBOb2RlID0gY2hpbGQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5nZXRQYXJlbnQoKSAmJiBjdXJyZW50LmdldFBhcmVudCgpLmdldFBhcmVudCgpKVxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBcInxcIjtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50LmdldFBhcmVudCgpICYmIGN1cnJlbnQuZ2V0UGFyZW50KCkuZ2V0UGFyZW50KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gXCIgICBcIjtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBcIictLVwiO1xyXG5cclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBjaGlsZC5uYW1lO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRoaXMuY3JlYXRlU2NlbmVHcmFwaChjaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIge1xyXG4gICAgICAgIFtldmVudFR5cGU6IHN0cmluZ106IEV2ZW50TGlzdGVuZXJbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFR5cGVzIG9mIGV2ZW50cyBzcGVjaWZpYyB0byBGdWRnZSwgaW4gYWRkaXRpb24gdG8gdGhlIHN0YW5kYXJkIERPTS9Ccm93c2VyLVR5cGVzIGFuZCBjdXN0b20gc3RyaW5nc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBFVkVOVCB7XHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gdGFyZ2V0cyByZWdpc3RlcmVkIGF0IFtbTG9vcF1dLCB3aGVuIHJlcXVlc3RlZCBhbmltYXRpb24gZnJhbWUgc3RhcnRzICovXHJcbiAgICAgICAgTE9PUF9GUkFNRSA9IFwibG9vcEZyYW1lXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBbW0NvbXBvbmVudF1dIHdoZW4gaXRzIGJlaW5nIGFkZGVkIHRvIGEgW1tOb2RlXV0gKi9cclxuICAgICAgICBDT01QT05FTlRfQUREID0gXCJjb21wb25lbnRBZGRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIFtbQ29tcG9uZW50XV0gd2hlbiBpdHMgYmVpbmcgcmVtb3ZlZCBmcm9tIGEgW1tOb2RlXV0gKi9cclxuICAgICAgICBDT01QT05FTlRfUkVNT1ZFID0gXCJjb21wb25lbnRSZW1vdmVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIFtbQ29tcG9uZW50XV0gd2hlbiBpdHMgYmVpbmcgYWN0aXZhdGVkICovXHJcbiAgICAgICAgQ09NUE9ORU5UX0FDVElWQVRFID0gXCJjb21wb25lbnRBY3RpdmF0ZVwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgW1tDb21wb25lbnRdXSB3aGVuIGl0cyBiZWluZyBkZWFjdGl2YXRlZCAqL1xyXG4gICAgICAgIENPTVBPTkVOVF9ERUFDVElWQVRFID0gXCJjb21wb25lbnREZWFjdGl2YXRlXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBjaGlsZCBbW05vZGVdXSBhbmQgaXRzIGFuY2VzdG9ycyBhZnRlciBpdCB3YXMgYXBwZW5kZWQgdG8gYSBwYXJlbnQgKi9cclxuICAgICAgICBDSElMRF9BUFBFTkQgPSBcImNoaWxkQWRkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBjaGlsZCBbW05vZGVdXSBhbmQgaXRzIGFuY2VzdG9ycyBqdXN0IGJlZm9yZSBpdHMgYmVpbmcgcmVtb3ZlZCBmcm9tIGl0cyBwYXJlbnQgKi9cclxuICAgICAgICBDSElMRF9SRU1PVkUgPSBcImNoaWxkUmVtb3ZlXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBbW011dGFibGVdXSB3aGVuIGl0cyBiZWluZyBtdXRhdGVkICovXHJcbiAgICAgICAgTVVUQVRFID0gXCJtdXRhdGVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW1ZpZXdwb3J0XV0gd2hlbiBpdCBnZXRzIHRoZSBmb2N1cyB0byByZWNlaXZlIGtleWJvYXJkIGlucHV0ICovXHJcbiAgICAgICAgRk9DVVNfSU4gPSBcImZvY3VzaW5cIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW1ZpZXdwb3J0XV0gd2hlbiBpdCBsb3NlcyB0aGUgZm9jdXMgdG8gcmVjZWl2ZSBrZXlib2FyZCBpbnB1dCAqL1xyXG4gICAgICAgIEZPQ1VTX09VVCA9IFwiZm9jdXNvdXRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW05vZGVdXSB3aGVuIGl0J3MgZG9uZSBzZXJpYWxpemluZyAqL1xyXG4gICAgICAgIE5PREVfU0VSSUFMSVpFRCA9IFwibm9kZVNlcmlhbGl6ZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW05vZGVdXSB3aGVuIGl0J3MgZG9uZSBkZXNlcmlhbGl6aW5nLCBzbyBhbGwgY29tcG9uZW50cywgY2hpbGRyZW4gYW5kIGF0dHJpYnV0ZXMgYXJlIGF2YWlsYWJsZSAqL1xyXG4gICAgICAgIE5PREVfREVTRVJJQUxJWkVEID0gXCJub2RlRGVzZXJpYWxpemVkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tOb2RlUmVzb3VyY2VJbnN0YW5jZV1dIHdoZW4gaXQncyBjb250ZW50IGlzIHNldCBhY2NvcmRpbmcgdG8gYSBzZXJpYWxpemF0aW9uIG9mIGEgW1tOb2RlUmVzb3VyY2VdXSAgKi9cclxuICAgICAgICBOT0RFUkVTT1VSQ0VfSU5TVEFOVElBVEVEID0gXCJub2RlUmVzb3VyY2VJbnN0YW50aWF0ZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW1RpbWVdXSB3aGVuIGl0J3Mgc2NhbGluZyBjaGFuZ2VkICAqL1xyXG4gICAgICAgIFRJTUVfU0NBTEVEID0gXCJ0aW1lU2NhbGVkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tGaWxlSW9dXSB3aGVuIGEgbGlzdCBvZiBmaWxlcyBoYXMgYmVlbiBsb2FkZWQgICovXHJcbiAgICAgICAgRklMRV9MT0FERUQgPSBcImZpbGVMb2FkZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW0ZpbGVJb11dIHdoZW4gYSBsaXN0IG9mIGZpbGVzIGhhcyBiZWVuIHNhdmVkICovXHJcbiAgICAgICAgRklMRV9TQVZFRCA9IFwiZmlsZVNhdmVkXCJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBFVkVOVF9QT0lOVEVSIHtcclxuICAgICAgICBVUCA9IFwixpJwb2ludGVydXBcIixcclxuICAgICAgICBET1dOID0gXCLGknBvaW50ZXJkb3duXCJcclxuICAgIH1cclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIEVWRU5UX0RSQUdEUk9QIHtcclxuICAgICAgICBEUkFHID0gXCLGkmRyYWdcIixcclxuICAgICAgICBEUk9QID0gXCLGkmRyb3BcIixcclxuICAgICAgICBTVEFSVCA9IFwixpJkcmFnc3RhcnRcIixcclxuICAgICAgICBFTkQgPSBcIsaSZHJhZ2VuZFwiLFxyXG4gICAgICAgIE9WRVIgPSBcIsaSZHJhZ292ZXJcIlxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRVZFTlRfV0hFRUwge1xyXG4gICAgICAgIFdIRUVMID0gXCLGkndoZWVsXCJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUG9pbnRlckV2ZW50xpIgZXh0ZW5kcyBQb2ludGVyRXZlbnQge1xyXG4gICAgICAgIHB1YmxpYyBwb2ludGVyWDogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBwb2ludGVyWTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjYW52YXNYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNhbnZhc1k6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2xpZW50UmVjdDogQ2xpZW50UmVjdDtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBfZXZlbnQ6IFBvaW50ZXJFdmVudMaSKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKHR5cGUsIF9ldmVudCk7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50Pl9ldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50UmVjdCA9IHRhcmdldC5nZXRDbGllbnRSZWN0cygpWzBdO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJYID0gX2V2ZW50LmNsaWVudFggLSB0aGlzLmNsaWVudFJlY3QubGVmdDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyWSA9IF9ldmVudC5jbGllbnRZIC0gdGhpcy5jbGllbnRSZWN0LnRvcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIERyYWdEcm9wRXZlbnTGkiBleHRlbmRzIERyYWdFdmVudCB7XHJcbiAgICAgICAgcHVibGljIHBvaW50ZXJYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHBvaW50ZXJZOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNhbnZhc1g6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2FudmFzWTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjbGllbnRSZWN0OiBDbGllbnRSZWN0O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIF9ldmVudDogRHJhZ0Ryb3BFdmVudMaSKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKHR5cGUsIF9ldmVudCk7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50Pl9ldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50UmVjdCA9IHRhcmdldC5nZXRDbGllbnRSZWN0cygpWzBdO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJYID0gX2V2ZW50LmNsaWVudFggLSB0aGlzLmNsaWVudFJlY3QubGVmdDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyWSA9IF9ldmVudC5jbGllbnRZIC0gdGhpcy5jbGllbnRSZWN0LnRvcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFdoZWVsRXZlbnTGkiBleHRlbmRzIFdoZWVsRXZlbnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgX2V2ZW50OiBXaGVlbEV2ZW50xpIpIHtcclxuICAgICAgICAgICAgc3VwZXIodHlwZSwgX2V2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlIGNsYXNzIGZvciBFdmVudFRhcmdldCBzaW5nbGV0b25zLCB3aGljaCBhcmUgZml4ZWQgZW50aXRpZXMgaW4gdGhlIHN0cnVjdHVyZSBvZiBGdWRnZSwgc3VjaCBhcyB0aGUgY29yZSBsb29wIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRXZlbnRUYXJnZXRTdGF0aWMgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyB0YXJnZXRTdGF0aWM6IEV2ZW50VGFyZ2V0U3RhdGljID0gbmV3IEV2ZW50VGFyZ2V0U3RhdGljKCk7XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYWRkRXZlbnRMaXN0ZW5lcihfdHlwZTogc3RyaW5nLCBfaGFuZGxlcjogRXZlbnRMaXN0ZW5lcik6IHZvaWQge1xyXG4gICAgICAgICAgICBFdmVudFRhcmdldFN0YXRpYy50YXJnZXRTdGF0aWMuYWRkRXZlbnRMaXN0ZW5lcihfdHlwZSwgX2hhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUV2ZW50TGlzdGVuZXIoX3R5cGU6IHN0cmluZywgX2hhbmRsZXI6IEV2ZW50TGlzdGVuZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgRXZlbnRUYXJnZXRTdGF0aWMudGFyZ2V0U3RhdGljLnJlbW92ZUV2ZW50TGlzdGVuZXIoX3R5cGUsIF9oYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkaXNwYXRjaEV2ZW50KF9ldmVudDogRXZlbnQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgRXZlbnRUYXJnZXRTdGF0aWMudGFyZ2V0U3RhdGljLmRpc3BhdGNoRXZlbnQoX2V2ZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgS2V5Ym9hcmRFdmVudMaSIGV4dGVuZHMgS2V5Ym9hcmRFdmVudCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBfZXZlbnQ6IEtleWJvYXJkRXZlbnTGkikge1xyXG4gICAgICAgICAgICBzdXBlcih0eXBlLCBfZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcHBpbmdzIG9mIHN0YW5kYXJkIERPTS9Ccm93c2VyLUV2ZW50cyBhcyBwYXNzZWQgZnJvbSBhIGNhbnZhcyB0byB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRVZFTlRfS0VZQk9BUkQge1xyXG4gICAgICAgIFVQID0gXCLGkmtleXVwXCIsXHJcbiAgICAgICAgRE9XTiA9IFwixpJrZXlkb3duXCJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb2RlcyBzZW50IGZyb20gYSBzdGFuZGFyZCBlbmdsaXNoIGtleWJvYXJkIGxheW91dFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZW51bSBLRVlCT0FSRF9DT0RFIHtcclxuICAgICAgICBBID0gXCJLZXlBXCIsXHJcbiAgICAgICAgQiA9IFwiS2V5QlwiLFxyXG4gICAgICAgIEMgPSBcIktleUNcIixcclxuICAgICAgICBEID0gXCJLZXlEXCIsXHJcbiAgICAgICAgRSA9IFwiS2V5RVwiLFxyXG4gICAgICAgIEYgPSBcIktleUZcIixcclxuICAgICAgICBHID0gXCJLZXlHXCIsXHJcbiAgICAgICAgSCA9IFwiS2V5SFwiLFxyXG4gICAgICAgIEkgPSBcIktleUlcIixcclxuICAgICAgICBKID0gXCJLZXlKXCIsXHJcbiAgICAgICAgSyA9IFwiS2V5S1wiLFxyXG4gICAgICAgIEwgPSBcIktleUxcIixcclxuICAgICAgICBNID0gXCJLZXlNXCIsXHJcbiAgICAgICAgTiA9IFwiS2V5TlwiLFxyXG4gICAgICAgIE8gPSBcIktleU9cIixcclxuICAgICAgICBQID0gXCJLZXlQXCIsXHJcbiAgICAgICAgUSA9IFwiS2V5UVwiLFxyXG4gICAgICAgIFIgPSBcIktleVJcIixcclxuICAgICAgICBTID0gXCJLZXlTXCIsXHJcbiAgICAgICAgVCA9IFwiS2V5VFwiLFxyXG4gICAgICAgIFUgPSBcIktleVVcIixcclxuICAgICAgICBWID0gXCJLZXlWXCIsXHJcbiAgICAgICAgVyA9IFwiS2V5V1wiLFxyXG4gICAgICAgIFggPSBcIktleVhcIixcclxuICAgICAgICBZID0gXCJLZXlZXCIsXHJcbiAgICAgICAgWiA9IFwiS2V5WlwiLFxyXG4gICAgICAgIEVTQyA9IFwiRXNjYXBlXCIsXHJcbiAgICAgICAgWkVSTyA9IFwiRGlnaXQwXCIsXHJcbiAgICAgICAgT05FID0gXCJEaWdpdDFcIixcclxuICAgICAgICBUV08gPSBcIkRpZ2l0MlwiLFxyXG4gICAgICAgIFRIUkVFID0gXCJEaWdpdDNcIixcclxuICAgICAgICBGT1VSID0gXCJEaWdpdDRcIixcclxuICAgICAgICBGSVZFID0gXCJEaWdpdDVcIixcclxuICAgICAgICBTSVggPSBcIkRpZ2l0NlwiLFxyXG4gICAgICAgIFNFVkVOID0gXCJEaWdpdDdcIixcclxuICAgICAgICBFSUdIVCA9IFwiRGlnaXQ4XCIsXHJcbiAgICAgICAgTklORSA9IFwiRGlnaXQ5XCIsXHJcbiAgICAgICAgTUlOVVMgPSBcIk1pbnVzXCIsXHJcbiAgICAgICAgRVFVQUwgPSBcIkVxdWFsXCIsXHJcbiAgICAgICAgQkFDS1NQQUNFID0gXCJCYWNrc3BhY2VcIixcclxuICAgICAgICBUQUJVTEFUT1IgPSBcIlRhYlwiLFxyXG4gICAgICAgIEJSQUNLRVRfTEVGVCA9IFwiQnJhY2tldExlZnRcIixcclxuICAgICAgICBCUkFDS0VUX1JJR0hUID0gXCJCcmFja2V0UmlnaHRcIixcclxuICAgICAgICBFTlRFUiA9IFwiRW50ZXJcIixcclxuICAgICAgICBDVFJMX0xFRlQgPSBcIkNvbnRyb2xMZWZ0XCIsXHJcbiAgICAgICAgU0VNSUNPTE9OID0gXCJTZW1pY29sb25cIixcclxuICAgICAgICBRVU9URSA9IFwiUXVvdGVcIixcclxuICAgICAgICBCQUNLX1FVT1RFID0gXCJCYWNrcXVvdGVcIixcclxuICAgICAgICBTSElGVF9MRUZUID0gXCJTaGlmdExlZnRcIixcclxuICAgICAgICBCQUNLU0xBU0ggPSBcIkJhY2tzbGFzaFwiLFxyXG4gICAgICAgIENPTU1BID0gXCJDb21tYVwiLFxyXG4gICAgICAgIFBFUklPRCA9IFwiUGVyaW9kXCIsXHJcbiAgICAgICAgU0xBU0ggPSBcIlNsYXNoXCIsXHJcbiAgICAgICAgU0hJRlRfUklHSFQgPSBcIlNoaWZ0UmlnaHRcIixcclxuICAgICAgICBOVU1QQURfTVVMVElQTFkgPSBcIk51bXBhZE11bHRpcGx5XCIsXHJcbiAgICAgICAgQUxUX0xFRlQgPSBcIkFsdExlZnRcIixcclxuICAgICAgICBTUEFDRSA9IFwiU3BhY2VcIixcclxuICAgICAgICBDQVBTX0xPQ0sgPSBcIkNhcHNMb2NrXCIsXHJcbiAgICAgICAgRjEgPSBcIkYxXCIsXHJcbiAgICAgICAgRjIgPSBcIkYyXCIsXHJcbiAgICAgICAgRjMgPSBcIkYzXCIsXHJcbiAgICAgICAgRjQgPSBcIkY0XCIsXHJcbiAgICAgICAgRjUgPSBcIkY1XCIsXHJcbiAgICAgICAgRjYgPSBcIkY2XCIsXHJcbiAgICAgICAgRjcgPSBcIkY3XCIsXHJcbiAgICAgICAgRjggPSBcIkY4XCIsXHJcbiAgICAgICAgRjkgPSBcIkY5XCIsXHJcbiAgICAgICAgRjEwID0gXCJGMTBcIixcclxuICAgICAgICBQQVVTRSA9IFwiUGF1c2VcIixcclxuICAgICAgICBTQ1JPTExfTE9DSyA9IFwiU2Nyb2xsTG9ja1wiLFxyXG4gICAgICAgIE5VTVBBRDcgPSBcIk51bXBhZDdcIixcclxuICAgICAgICBOVU1QQUQ4ID0gXCJOdW1wYWQ4XCIsXHJcbiAgICAgICAgTlVNUEFEOSA9IFwiTnVtcGFkOVwiLFxyXG4gICAgICAgIE5VTVBBRF9TVUJUUkFDVCA9IFwiTnVtcGFkU3VidHJhY3RcIixcclxuICAgICAgICBOVU1QQUQ0ID0gXCJOdW1wYWQ0XCIsXHJcbiAgICAgICAgTlVNUEFENSA9IFwiTnVtcGFkNVwiLFxyXG4gICAgICAgIE5VTVBBRDYgPSBcIk51bXBhZDZcIixcclxuICAgICAgICBOVU1QQURfQUREID0gXCJOdW1wYWRBZGRcIixcclxuICAgICAgICBOVU1QQUQxID0gXCJOdW1wYWQxXCIsXHJcbiAgICAgICAgTlVNUEFEMiA9IFwiTnVtcGFkMlwiLFxyXG4gICAgICAgIE5VTVBBRDMgPSBcIk51bXBhZDNcIixcclxuICAgICAgICBOVU1QQUQwID0gXCJOdW1wYWQwXCIsXHJcbiAgICAgICAgTlVNUEFEX0RFQ0lNQUwgPSBcIk51bXBhZERlY2ltYWxcIixcclxuICAgICAgICBQUklOVF9TQ1JFRU4gPSBcIlByaW50U2NyZWVuXCIsXHJcbiAgICAgICAgSU5UTF9CQUNLX1NMQVNIID0gXCJJbnRsQmFja1NsYXNoXCIsXHJcbiAgICAgICAgRjExID0gXCJGMTFcIixcclxuICAgICAgICBGMTIgPSBcIkYxMlwiLFxyXG4gICAgICAgIE5VTVBBRF9FUVVBTCA9IFwiTnVtcGFkRXF1YWxcIixcclxuICAgICAgICBGMTMgPSBcIkYxM1wiLFxyXG4gICAgICAgIEYxNCA9IFwiRjE0XCIsXHJcbiAgICAgICAgRjE1ID0gXCJGMTVcIixcclxuICAgICAgICBGMTYgPSBcIkYxNlwiLFxyXG4gICAgICAgIEYxNyA9IFwiRjE3XCIsXHJcbiAgICAgICAgRjE4ID0gXCJGMThcIixcclxuICAgICAgICBGMTkgPSBcIkYxOVwiLFxyXG4gICAgICAgIEYyMCA9IFwiRjIwXCIsXHJcbiAgICAgICAgRjIxID0gXCJGMjFcIixcclxuICAgICAgICBGMjIgPSBcIkYyMlwiLFxyXG4gICAgICAgIEYyMyA9IFwiRjIzXCIsXHJcbiAgICAgICAgRjI0ID0gXCJGMjRcIixcclxuICAgICAgICBLQU5BX01PREUgPSBcIkthbmFNb2RlXCIsXHJcbiAgICAgICAgTEFORzIgPSBcIkxhbmcyXCIsXHJcbiAgICAgICAgTEFORzEgPSBcIkxhbmcxXCIsXHJcbiAgICAgICAgSU5UTF9STyA9IFwiSW50bFJvXCIsXHJcbiAgICAgICAgQ09OVkVSVCA9IFwiQ29udmVydFwiLFxyXG4gICAgICAgIE5PTl9DT05WRVJUID0gXCJOb25Db252ZXJ0XCIsXHJcbiAgICAgICAgSU5UTF9ZRU4gPSBcIkludGxZZW5cIixcclxuICAgICAgICBOVU1QQURfQ09NTUEgPSBcIk51bXBhZENvbW1hXCIsXHJcbiAgICAgICAgVU5ETyA9IFwiVW5kb1wiLFxyXG4gICAgICAgIFBBU1RFID0gXCJQYXN0ZVwiLFxyXG4gICAgICAgIE1FRElBX1RSQUNLX1BSRVZJT1VTID0gXCJNZWRpYVRyYWNrUHJldmlvdXNcIixcclxuICAgICAgICBDVVQgPSBcIkN1dFwiLFxyXG4gICAgICAgIENPUFkgPSBcIkNvcHlcIixcclxuICAgICAgICBNRURJQV9UUkFDS19ORVhUID0gXCJNZWRpYVRyYWNrTmV4dFwiLFxyXG4gICAgICAgIE5VTVBBRF9FTlRFUiA9IFwiTnVtcGFkRW50ZXJcIixcclxuICAgICAgICBDVFJMX1JJR0hUID0gXCJDb250cm9sUmlnaHRcIixcclxuICAgICAgICBBVURJT19WT0xVTUVfTVVURSA9IFwiQXVkaW9Wb2x1bWVNdXRlXCIsXHJcbiAgICAgICAgTEFVTkNIX0FQUDIgPSBcIkxhdW5jaEFwcDJcIixcclxuICAgICAgICBNRURJQV9QTEFZX1BBVVNFID0gXCJNZWRpYVBsYXlQYXVzZVwiLFxyXG4gICAgICAgIE1FRElBX1NUT1AgPSBcIk1lZGlhU3RvcFwiLFxyXG4gICAgICAgIEVKRUNUID0gXCJFamVjdFwiLFxyXG4gICAgICAgIEFVRElPX1ZPTFVNRV9ET1dOID0gXCJBdWRpb1ZvbHVtZURvd25cIixcclxuICAgICAgICBWT0xVTUVfRE9XTiA9IFwiVm9sdW1lRG93blwiLFxyXG4gICAgICAgIEFVRElPX1ZPTFVNRV9VUCA9IFwiQXVkaW9Wb2x1bWVVcFwiLFxyXG4gICAgICAgIFZPTFVNRV9VUCA9IFwiVm9sdW1lVXBcIixcclxuICAgICAgICBCUk9XU0VSX0hPTUUgPSBcIkJyb3dzZXJIb21lXCIsXHJcbiAgICAgICAgTlVNUEFEX0RJVklERSA9IFwiTnVtcGFkRGl2aWRlXCIsXHJcbiAgICAgICAgQUxUX1JJR0hUID0gXCJBbHRSaWdodFwiLFxyXG4gICAgICAgIEhFTFAgPSBcIkhlbHBcIixcclxuICAgICAgICBOVU1fTE9DSyA9IFwiTnVtTG9ja1wiLFxyXG4gICAgICAgIEhPTUUgPSBcIkhvbWVcIixcclxuICAgICAgICBBUlJPV19VUCA9IFwiQXJyb3dVcFwiLFxyXG4gICAgICAgIEFSUk9XX1JJR0hUID0gXCJBcnJvd1JpZ2h0XCIsXHJcbiAgICAgICAgQVJST1dfRE9XTiA9IFwiQXJyb3dEb3duXCIsXHJcbiAgICAgICAgQVJST1dfTEVGVCA9IFwiQXJyb3dMZWZ0XCIsXHJcbiAgICAgICAgRU5EID0gXCJFbmRcIixcclxuICAgICAgICBQQUdFX1VQID0gXCJQYWdlVXBcIixcclxuICAgICAgICBQQUdFX0RPV04gPSBcIlBhZ2VEb3duXCIsXHJcbiAgICAgICAgSU5TRVJUID0gXCJJbnNlcnRcIixcclxuICAgICAgICBERUxFVEUgPSBcIkRlbGV0ZVwiLFxyXG4gICAgICAgIE1FVEFfTEVGVCA9IFwiTWV0YV9MZWZ0XCIsXHJcbiAgICAgICAgT1NfTEVGVCA9IFwiT1NMZWZ0XCIsXHJcbiAgICAgICAgTUVUQV9SSUdIVCA9IFwiTWV0YVJpZ2h0XCIsXHJcbiAgICAgICAgT1NfUklHSFQgPSBcIk9TUmlnaHRcIixcclxuICAgICAgICBDT05URVhUX01FTlUgPSBcIkNvbnRleHRNZW51XCIsXHJcbiAgICAgICAgUE9XRVIgPSBcIlBvd2VyXCIsXHJcbiAgICAgICAgQlJPV1NFUl9TRUFSQ0ggPSBcIkJyb3dzZXJTZWFyY2hcIixcclxuICAgICAgICBCUk9XU0VSX0ZBVk9SSVRFUyA9IFwiQnJvd3NlckZhdm9yaXRlc1wiLFxyXG4gICAgICAgIEJST1dTRVJfUkVGUkVTSCA9IFwiQnJvd3NlclJlZnJlc2hcIixcclxuICAgICAgICBCUk9XU0VSX1NUT1AgPSBcIkJyb3dzZXJTdG9wXCIsXHJcbiAgICAgICAgQlJPV1NFUl9GT1JXQVJEID0gXCJCcm93c2VyRm9yd2FyZFwiLFxyXG4gICAgICAgIEJST1dTRVJfQkFDSyA9IFwiQnJvd3NlckJhY2tcIixcclxuICAgICAgICBMQVVOQ0hfQVBQMSA9IFwiTGF1bmNoQXBwMVwiLFxyXG4gICAgICAgIExBVU5DSF9NQUlMID0gXCJMYXVuY2hNYWlsXCIsXHJcbiAgICAgICAgTEFVTkNIX01FRElBX1BMQVlFUiA9IFwiTGF1bmNoTWVkaWFQbGF5ZXJcIixcclxuXHJcbiAgICAgICAgLy9tYWMgYnJpbmdzIHRoaXMgYnV0dHRvblxyXG4gICAgICAgIEZOID0gXCJGblwiLCAvL25vIGV2ZW50IGZpcmVkIGFjdHVhbGx5XHJcblxyXG4gICAgICAgIC8vTGludXggYnJpbmdzIHRoZXNlXHJcbiAgICAgICAgQUdBSU4gPSBcIkFnYWluXCIsXHJcbiAgICAgICAgUFJPUFMgPSBcIlByb3BzXCIsXHJcbiAgICAgICAgU0VMRUNUID0gXCJTZWxlY3RcIixcclxuICAgICAgICBPUEVOID0gXCJPcGVuXCIsXHJcbiAgICAgICAgRklORCA9IFwiRmluZFwiLFxyXG4gICAgICAgIFdBS0VfVVAgPSBcIldha2VVcFwiLFxyXG4gICAgICAgIE5VTVBBRF9QQVJFTlRfTEVGVCA9IFwiTnVtcGFkUGFyZW50TGVmdFwiLFxyXG4gICAgICAgIE5VTVBBRF9QQVJFTlRfUklHSFQgPSBcIk51bXBhZFBhcmVudFJpZ2h0XCIsXHJcblxyXG4gICAgICAgIC8vYW5kcm9pZFxyXG4gICAgICAgIFNMRUVQID0gXCJTbGVlcFwiXHJcbiAgICB9XHJcbiAgICAvKiBcclxuICAgIEZpcmVmb3ggY2FuJ3QgbWFrZSB1c2Ugb2YgdGhvc2UgYnV0dG9ucyBhbmQgQ29tYmluYXRpb25zOlxyXG4gICAgU0lOR0VMRV9CVVRUT05TOlxyXG4gICAgIERydWNrLFxyXG4gICAgQ09NQklOQVRJT05TOlxyXG4gICAgIFNoaWZ0ICsgRjEwLCBTaGlmdCArIE51bXBhZDUsXHJcbiAgICAgQ1RSTCArIHEsIENUUkwgKyBGNCxcclxuICAgICBBTFQgKyBGMSwgQUxUICsgRjIsIEFMVCArIEYzLCBBTFQgKyBGNywgQUxUICsgRjgsIEFMVCArIEYxMFxyXG4gICAgT3BlcmEgd29uJ3QgZG8gZ29vZCB3aXRoIHRoZXNlIEJ1dHRvbnMgYW5kIGNvbWJpbmF0aW9uczpcclxuICAgIFNJTkdMRV9CVVRUT05TOlxyXG4gICAgIEZsb2F0MzJBcnJheSwgRjExLCBBTFQsXHJcbiAgICBDT01CSU5BVElPTlM6XHJcbiAgICAgQ1RSTCArIHEsIENUUkwgKyB0LCBDVFJMICsgaCwgQ1RSTCArIGcsIENUUkwgKyBuLCBDVFJMICsgZiBcclxuICAgICBBTFQgKyBGMSwgQUxUICsgRjIsIEFMVCArIEY0LCBBTFQgKyBGNSwgQUxUICsgRjYsIEFMVCArIEY3LCBBTFQgKyBGOCwgQUxUICsgRjEwXHJcbiAgICAgKi9cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBCb3JkZXIge1xyXG4gICAgICAgIGxlZnQ6IG51bWJlcjtcclxuICAgICAgICB0b3A6IG51bWJlcjtcclxuICAgICAgICByaWdodDogbnVtYmVyO1xyXG4gICAgICAgIGJvdHRvbTogbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRnJhbWluZyBkZXNjcmliZXMgaG93IHRvIG1hcCBhIHJlY3RhbmdsZSBpbnRvIGEgZ2l2ZW4gZnJhbWVcclxuICAgICAqIGFuZCBob3cgcG9pbnRzIGluIHRoZSBmcmFtZSBjb3JyZXNwb25kIHRvIHBvaW50cyBpbiB0aGUgcmVzdWx0aW5nIHJlY3RhbmdsZSBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZyYW1pbmcgZXh0ZW5kcyBNdXRhYmxlIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNYXBzIGEgcG9pbnQgaW4gdGhlIGdpdmVuIGZyYW1lIGFjY29yZGluZyB0byB0aGlzIGZyYW1pbmdcclxuICAgICAgICAgKiBAcGFyYW0gX3BvaW50SW5GcmFtZSBUaGUgcG9pbnQgaW4gdGhlIGZyYW1lIGdpdmVuXHJcbiAgICAgICAgICogQHBhcmFtIF9yZWN0RnJhbWUgVGhlIGZyYW1lIHRoZSBwb2ludCBpcyByZWxhdGl2ZSB0b1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRQb2ludChfcG9pbnRJbkZyYW1lOiBWZWN0b3IyLCBfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBWZWN0b3IyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNYXBzIGEgcG9pbnQgaW4gYSBnaXZlbiByZWN0YW5nbGUgYmFjayB0byBhIGNhbGN1bGF0ZWQgZnJhbWUgb2Ygb3JpZ2luXHJcbiAgICAgICAgICogQHBhcmFtIF9wb2ludCBUaGUgcG9pbnQgaW4gdGhlIHJlY3RhbmdsZVxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVjdCBUaGUgcmVjdGFuZ2xlIHRoZSBwb2ludCBpcyByZWxhdGl2ZSB0b1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRQb2ludEludmVyc2UoX3BvaW50OiBWZWN0b3IyLCBfcmVjdDogUmVjdGFuZ2xlKTogVmVjdG9yMjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMgYSByZWN0YW5nbGUgYXMgdGhlIGZyYW1lIGFuZCBjcmVhdGVzIGEgbmV3IHJlY3RhbmdsZSBhY2NvcmRpbmcgdG8gdGhlIGZyYW1pbmdcclxuICAgICAgICAgKiBAcGFyYW0gX3JlY3RGcmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRSZWN0KF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFJlY3RhbmdsZTtcclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcmVzdWx0aW5nIHJlY3RhbmdsZSBoYXMgYSBmaXhlZCB3aWR0aCBhbmQgaGVpZ2h0IGFuZCBkaXNwbGF5IHNob3VsZCBzY2FsZSB0byBmaXQgdGhlIGZyYW1lXHJcbiAgICAgKiBQb2ludHMgYXJlIHNjYWxlZCBpbiB0aGUgc2FtZSByYXRpb1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRnJhbWluZ0ZpeGVkIGV4dGVuZHMgRnJhbWluZyB7XHJcbiAgICAgICAgcHVibGljIHdpZHRoOiBudW1iZXIgPSAzMDA7XHJcbiAgICAgICAgcHVibGljIGhlaWdodDogbnVtYmVyID0gMTUwO1xyXG5cclxuICAgICAgICBwdWJsaWMgc2V0U2l6ZShfd2lkdGg6IG51bWJlciwgX2hlaWdodDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBfd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gX2hlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludChfcG9pbnRJbkZyYW1lOiBWZWN0b3IyLCBfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCAqIChfcG9pbnRJbkZyYW1lLnggLSBfcmVjdEZyYW1lLngpIC8gX3JlY3RGcmFtZS53aWR0aCxcclxuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ICogKF9wb2ludEluRnJhbWUueSAtIF9yZWN0RnJhbWUueSkgLyBfcmVjdEZyYW1lLmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFBvaW50SW52ZXJzZShfcG9pbnQ6IFZlY3RvcjIsIF9yZWN0OiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnggKiBfcmVjdC53aWR0aCAvIHRoaXMud2lkdGggKyBfcmVjdC54LFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnkgKiBfcmVjdC5oZWlnaHQgLyB0aGlzLmhlaWdodCArIF9yZWN0LnlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWN0KF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHJlc3VsdGluZyByZWN0YW5nbGUgYXJlIGZyYWN0aW9ucyBvZiB0aG9zZSBvZiB0aGUgZnJhbWUsIHNjYWxlZCBieSBub3JtZWQgdmFsdWVzIG5vcm1XaWR0aCBhbmQgbm9ybUhlaWdodC5cclxuICAgICAqIERpc3BsYXkgc2hvdWxkIHNjYWxlIHRvIGZpdCB0aGUgZnJhbWUgYW5kIHBvaW50cyBhcmUgc2NhbGVkIGluIHRoZSBzYW1lIHJhdGlvXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBGcmFtaW5nU2NhbGVkIGV4dGVuZHMgRnJhbWluZyB7XHJcbiAgICAgICAgcHVibGljIG5vcm1XaWR0aDogbnVtYmVyID0gMS4wO1xyXG4gICAgICAgIHB1YmxpYyBub3JtSGVpZ2h0OiBudW1iZXIgPSAxLjA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRTY2FsZShfbm9ybVdpZHRoOiBudW1iZXIsIF9ub3JtSGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5ub3JtV2lkdGggPSBfbm9ybVdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLm5vcm1IZWlnaHQgPSBfbm9ybUhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludChfcG9pbnRJbkZyYW1lOiBWZWN0b3IyLCBfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3JtV2lkdGggKiAoX3BvaW50SW5GcmFtZS54IC0gX3JlY3RGcmFtZS54KSxcclxuICAgICAgICAgICAgICAgIHRoaXMubm9ybUhlaWdodCAqIChfcG9pbnRJbkZyYW1lLnkgLSBfcmVjdEZyYW1lLnkpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnRJbnZlcnNlKF9wb2ludDogVmVjdG9yMiwgX3JlY3Q6IFJlY3RhbmdsZSk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgICAgICBfcG9pbnQueCAvIHRoaXMubm9ybVdpZHRoICsgX3JlY3QueCxcclxuICAgICAgICAgICAgICAgIF9wb2ludC55IC8gdGhpcy5ub3JtSGVpZ2h0ICsgX3JlY3QueVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFJlY3QoX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGhpcy5ub3JtV2lkdGggKiBfcmVjdEZyYW1lLndpZHRoLCB0aGlzLm5vcm1IZWlnaHQgKiBfcmVjdEZyYW1lLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlc3VsdGluZyByZWN0YW5nbGUgZml0cyBpbnRvIGEgbWFyZ2luIGdpdmVuIGFzIGZyYWN0aW9ucyBvZiB0aGUgc2l6ZSBvZiB0aGUgZnJhbWUgZ2l2ZW4gYnkgbm9ybUFuY2hvclxyXG4gICAgICogcGx1cyBhbiBhYnNvbHV0ZSBwYWRkaW5nIGdpdmVuIGJ5IHBpeGVsQm9yZGVyLiBEaXNwbGF5IHNob3VsZCBmaXQgaW50byB0aGlzLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRnJhbWluZ0NvbXBsZXggZXh0ZW5kcyBGcmFtaW5nIHtcclxuICAgICAgICBwdWJsaWMgbWFyZ2luOiBCb3JkZXIgPSB7IGxlZnQ6IDAsIHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCB9O1xyXG4gICAgICAgIHB1YmxpYyBwYWRkaW5nOiBCb3JkZXIgPSB7IGxlZnQ6IDAsIHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnQoX3BvaW50SW5GcmFtZTogVmVjdG9yMiwgX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgICAgIF9wb2ludEluRnJhbWUueCAtIHRoaXMucGFkZGluZy5sZWZ0IC0gdGhpcy5tYXJnaW4ubGVmdCAqIF9yZWN0RnJhbWUud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBfcG9pbnRJbkZyYW1lLnkgLSB0aGlzLnBhZGRpbmcudG9wIC0gdGhpcy5tYXJnaW4udG9wICogX3JlY3RGcmFtZS5oZWlnaHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGdldFBvaW50SW52ZXJzZShfcG9pbnQ6IFZlY3RvcjIsIF9yZWN0OiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnggKyB0aGlzLnBhZGRpbmcubGVmdCArIHRoaXMubWFyZ2luLmxlZnQgKiBfcmVjdC53aWR0aCxcclxuICAgICAgICAgICAgICAgIF9wb2ludC55ICsgdGhpcy5wYWRkaW5nLnRvcCArIHRoaXMubWFyZ2luLnRvcCAqIF9yZWN0LmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFJlY3QoX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgaWYgKCFfcmVjdEZyYW1lKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWluWDogbnVtYmVyID0gX3JlY3RGcmFtZS54ICsgdGhpcy5tYXJnaW4ubGVmdCAqIF9yZWN0RnJhbWUud2lkdGggKyB0aGlzLnBhZGRpbmcubGVmdDtcclxuICAgICAgICAgICAgbGV0IG1pblk6IG51bWJlciA9IF9yZWN0RnJhbWUueSArIHRoaXMubWFyZ2luLnRvcCAqIF9yZWN0RnJhbWUuaGVpZ2h0ICsgdGhpcy5wYWRkaW5nLnRvcDtcclxuICAgICAgICAgICAgbGV0IG1heFg6IG51bWJlciA9IF9yZWN0RnJhbWUueCArICgxIC0gdGhpcy5tYXJnaW4ucmlnaHQpICogX3JlY3RGcmFtZS53aWR0aCAtIHRoaXMucGFkZGluZy5yaWdodDtcclxuICAgICAgICAgICAgbGV0IG1heFk6IG51bWJlciA9IF9yZWN0RnJhbWUueSArICgxIC0gdGhpcy5tYXJnaW4uYm90dG9tKSAqIF9yZWN0RnJhbWUuaGVpZ2h0IC0gdGhpcy5wYWRkaW5nLmJvdHRvbTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKG1pblgsIG1pblksIG1heFggLSBtaW5YLCBtYXhZIC0gbWluWSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgbWFyZ2luOiB0aGlzLm1hcmdpbiwgcGFkZGluZzogdGhpcy5wYWRkaW5nIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaW1wbGUgY2xhc3MgZm9yIDN4MyBtYXRyaXggb3BlcmF0aW9ucyAoVGhpcyBjbGFzcyBjYW4gb25seSBoYW5kbGUgMkRcclxuICAgICAqIHRyYW5zZm9ybWF0aW9ucy4gQ291bGQgYmUgcmVtb3ZlZCBhZnRlciBhcHBseWluZyBmdWxsIDJEIGNvbXBhdGliaWxpdHkgdG8gTWF0NCkuXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBNYXRyaXgzeDMge1xyXG5cclxuICAgICAgICBwdWJsaWMgZGF0YTogbnVtYmVyW107XHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHByb2plY3Rpb24oX3dpZHRoOiBudW1iZXIsIF9oZWlnaHQ6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgMiAvIF93aWR0aCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIC0yIC8gX2hlaWdodCwgMCxcclxuICAgICAgICAgICAgICAgIC0xLCAxLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0IERhdGEoKTogbnVtYmVyW10ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGlkZW50aXR5KCk6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0cml4M3gzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgdHJhbnNsYXRlKF9tYXRyaXg6IE1hdHJpeDN4MywgX3hUcmFuc2xhdGlvbjogbnVtYmVyLCBfeVRyYW5zbGF0aW9uOiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseShfbWF0cml4LCB0aGlzLnRyYW5zbGF0aW9uKF94VHJhbnNsYXRpb24sIF95VHJhbnNsYXRpb24pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyByb3RhdGUoX21hdHJpeDogTWF0cml4M3gzLCBfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KF9tYXRyaXgsIHRoaXMucm90YXRpb24oX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2NhbGUoX21hdHJpeDogTWF0cml4M3gzLCBfeFNjYWxlOiBudW1iZXIsIF95c2NhbGU6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KF9tYXRyaXgsIHRoaXMuc2NhbGluZyhfeFNjYWxlLCBfeXNjYWxlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbXVsdGlwbHkoX2E6IE1hdHJpeDN4MywgX2I6IE1hdHJpeDN4Myk6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBhMDA6IG51bWJlciA9IF9hLmRhdGFbMCAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGEwMTogbnVtYmVyID0gX2EuZGF0YVswICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYTAyOiBudW1iZXIgPSBfYS5kYXRhWzAgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBhMTA6IG51bWJlciA9IF9hLmRhdGFbMSAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGExMTogbnVtYmVyID0gX2EuZGF0YVsxICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYTEyOiBudW1iZXIgPSBfYS5kYXRhWzEgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBhMjA6IG51bWJlciA9IF9hLmRhdGFbMiAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGEyMTogbnVtYmVyID0gX2EuZGF0YVsyICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYTIyOiBudW1iZXIgPSBfYS5kYXRhWzIgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBiMDA6IG51bWJlciA9IF9iLmRhdGFbMCAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGIwMTogbnVtYmVyID0gX2IuZGF0YVswICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYjAyOiBudW1iZXIgPSBfYi5kYXRhWzAgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBiMTA6IG51bWJlciA9IF9iLmRhdGFbMSAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGIxMTogbnVtYmVyID0gX2IuZGF0YVsxICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYjEyOiBudW1iZXIgPSBfYi5kYXRhWzEgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBiMjA6IG51bWJlciA9IF9iLmRhdGFbMiAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGIyMTogbnVtYmVyID0gX2IuZGF0YVsyICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYjIyOiBudW1iZXIgPSBfYi5kYXRhWzIgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwLFxyXG4gICAgICAgICAgICAgICAgYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxLFxyXG4gICAgICAgICAgICAgICAgYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyLFxyXG4gICAgICAgICAgICAgICAgYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwLFxyXG4gICAgICAgICAgICAgICAgYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxLFxyXG4gICAgICAgICAgICAgICAgYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyLFxyXG4gICAgICAgICAgICAgICAgYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwLFxyXG4gICAgICAgICAgICAgICAgYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxLFxyXG4gICAgICAgICAgICAgICAgYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHRyYW5zbGF0aW9uKF94VHJhbnNsYXRpb246IG51bWJlciwgX3lUcmFuc2xhdGlvbjogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4M3gzID0gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICAgICAgbWF0cml4LmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgICAgIF94VHJhbnNsYXRpb24sIF95VHJhbnNsYXRpb24sIDFcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc2NhbGluZyhfeFNjYWxlOiBudW1iZXIsIF95U2NhbGU6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgX3hTY2FsZSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIF95U2NhbGUsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJvdGF0aW9uKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgbGV0IGFuZ2xlSW5EZWdyZWVzOiBudW1iZXIgPSAzNjAgLSBfYW5nbGVJbkRlZ3JlZXM7XHJcbiAgICAgICAgICAgIGxldCBhbmdsZUluUmFkaWFuczogbnVtYmVyID0gYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICAgICAgICBsZXQgc2luOiBudW1iZXIgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgICAgICAgIGxldCBjb3M6IG51bWJlciA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4M3gzID0gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICAgICAgbWF0cml4LmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICBjb3MsIC1zaW4sIDAsXHJcbiAgICAgICAgICAgICAgICBzaW4sIGNvcywgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuXHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudHMgdGhlIG1hdHJpeCBhcyB0cmFuc2xhdGlvbiwgcm90YXRpb24gYW5kIHNjYWxpbmcgdmVjdG9yLCBiZWluZyBjYWxjdWxhdGVkIGZyb20gdGhlIG1hdHJpeFxyXG4gICAqL1xyXG4gIGludGVyZmFjZSBWZWN0b3JSZXByZXNlbnRhdGlvbiB7XHJcbiAgICB0cmFuc2xhdGlvbjogVmVjdG9yMztcclxuICAgIHJvdGF0aW9uOiBWZWN0b3IzO1xyXG4gICAgc2NhbGluZzogVmVjdG9yMztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0b3JlcyBhIDR4NCB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYW5kIHByb3ZpZGVzIG9wZXJhdGlvbnMgZm9yIGl0LlxyXG4gICAqIGBgYHBsYWludGV4dFxyXG4gICAqIFsgMCwgMSwgMiwgMyBdIOKGkCByb3cgdmVjdG9yIHhcclxuICAgKiBbIDQsIDUsIDYsIDcgXSDihpAgcm93IHZlY3RvciB5XHJcbiAgICogWyA4LCA5LDEwLDExIF0g4oaQIHJvdyB2ZWN0b3IgelxyXG4gICAqIFsxMiwxMywxNCwxNSBdIOKGkCB0cmFuc2xhdGlvblxyXG4gICAqICAgICAgICAgICAg4oaRICBob21vZ2VuZW91cyBjb2x1bW5cclxuICAgKiBgYGBcclxuICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICovXHJcblxyXG4gIGV4cG9ydCBjbGFzcyBNYXRyaXg0eDQgZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIHByaXZhdGUgZGF0YTogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSgxNik7IC8vIFRoZSBkYXRhIG9mIHRoZSBtYXRyaXguXHJcbiAgICBwcml2YXRlIG11dGF0b3I6IE11dGF0b3IgPSBudWxsOyAvLyBwcmVwYXJlZCBmb3Igb3B0aW1pemF0aW9uLCBrZWVwIG11dGF0b3IgdG8gcmVkdWNlIHJlZHVuZGFudCBjYWxjdWxhdGlvbiBhbmQgZm9yIGNvbXBhcmlzb24uIFNldCB0byBudWxsIHdoZW4gZGF0YSBjaGFuZ2VzIVxyXG4gICAgcHJpdmF0ZSB2ZWN0b3JzOiBWZWN0b3JSZXByZXNlbnRhdGlvbjsgLy8gdmVjdG9yIHJlcHJlc2VudGF0aW9uIG9mIFxyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5kYXRhLnNldChbXHJcbiAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy5yZXNldENhY2hlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogLSBnZXQ6IGEgY29weSBvZiB0aGUgY2FsY3VsYXRlZCB0cmFuc2xhdGlvbiB2ZWN0b3IgICBcclxuICAgICAqIC0gc2V0OiBlZmZlY3QgdGhlIG1hdHJpeCBpZ25vcmluZyBpdHMgcm90YXRpb24gYW5kIHNjYWxpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0cmFuc2xhdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgaWYgKCF0aGlzLnZlY3RvcnMudHJhbnNsYXRpb24pXHJcbiAgICAgICAgdGhpcy52ZWN0b3JzLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjModGhpcy5kYXRhWzEyXSwgdGhpcy5kYXRhWzEzXSwgdGhpcy5kYXRhWzE0XSk7XHJcbiAgICAgIHJldHVybiB0aGlzLnZlY3RvcnMudHJhbnNsYXRpb24uY29weTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgdHJhbnNsYXRpb24oX3RyYW5zbGF0aW9uOiBWZWN0b3IzKSB7XHJcbiAgICAgIHRoaXMuZGF0YS5zZXQoX3RyYW5zbGF0aW9uLmdldCgpLCAxMik7XHJcbiAgICAgIC8vIG5vIGZ1bGwgY2FjaGUgcmVzZXQgcmVxdWlyZWRcclxuICAgICAgdGhpcy52ZWN0b3JzLnRyYW5zbGF0aW9uID0gX3RyYW5zbGF0aW9uO1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIC0gZ2V0OiBhIGNvcHkgb2YgdGhlIGNhbGN1bGF0ZWQgcm90YXRpb24gdmVjdG9yICAgXHJcbiAgICAgKiAtIHNldDogZWZmZWN0IHRoZSBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCByb3RhdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgaWYgKCF0aGlzLnZlY3RvcnMucm90YXRpb24pXHJcbiAgICAgICAgdGhpcy52ZWN0b3JzLnJvdGF0aW9uID0gdGhpcy5nZXRFdWxlckFuZ2xlcygpO1xyXG4gICAgICByZXR1cm4gdGhpcy52ZWN0b3JzLnJvdGF0aW9uLmNvcHk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IHJvdGF0aW9uKF9yb3RhdGlvbjogVmVjdG9yMykge1xyXG4gICAgICB0aGlzLm11dGF0ZSh7IFwicm90YXRpb25cIjogX3JvdGF0aW9uIH0pO1xyXG4gICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiAtIGdldDogYSBjb3B5IG9mIHRoZSBjYWxjdWxhdGVkIHNjYWxlIHZlY3RvciAgIFxyXG4gICAgICogLSBzZXQ6IGVmZmVjdCB0aGUgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgc2NhbGluZygpOiBWZWN0b3IzIHtcclxuICAgICAgaWYgKCF0aGlzLnZlY3RvcnMuc2NhbGluZylcclxuICAgICAgICB0aGlzLnZlY3RvcnMuc2NhbGluZyA9IG5ldyBWZWN0b3IzKFxyXG4gICAgICAgICAgTWF0aC5oeXBvdCh0aGlzLmRhdGFbMF0sIHRoaXMuZGF0YVsxXSwgdGhpcy5kYXRhWzJdKSxcclxuICAgICAgICAgIE1hdGguaHlwb3QodGhpcy5kYXRhWzRdLCB0aGlzLmRhdGFbNV0sIHRoaXMuZGF0YVs2XSksXHJcbiAgICAgICAgICBNYXRoLmh5cG90KHRoaXMuZGF0YVs4XSwgdGhpcy5kYXRhWzldLCB0aGlzLmRhdGFbMTBdKVxyXG4gICAgICAgICk7XHJcbiAgICAgIHJldHVybiB0aGlzLnZlY3RvcnMuc2NhbGluZy5jb3B5O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBzY2FsaW5nKF9zY2FsaW5nOiBWZWN0b3IzKSB7XHJcbiAgICAgIHRoaXMubXV0YXRlKHsgXCJzY2FsaW5nXCI6IF9zY2FsaW5nIH0pO1xyXG4gICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyNyZWdpb24gU1RBVElDU1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSBhIG5ldyBpZGVudGl0eSBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgSURFTlRJVFkoKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgcmVzdWx0OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0KCk7XHJcbiAgICAgIGNvbnN0IHJlc3VsdDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIHJlc3VsdC5kYXRhLnNldChbXHJcbiAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIGFuZCByZXR1cm5zIHRoZSBwcm9kdWN0IG9mIHR3byBwYXNzZWQgbWF0cmljZXMuXHJcbiAgICAgKiBAcGFyYW0gX2EgVGhlIG1hdHJpeCB0byBtdWx0aXBseS5cclxuICAgICAqIEBwYXJhbSBfYiBUaGUgbWF0cml4IHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIE1VTFRJUExJQ0FUSU9OKF9hOiBNYXRyaXg0eDQsIF9iOiBNYXRyaXg0eDQpOiBNYXRyaXg0eDQge1xyXG4gICAgICBsZXQgYTogRmxvYXQzMkFycmF5ID0gX2EuZGF0YTtcclxuICAgICAgbGV0IGI6IEZsb2F0MzJBcnJheSA9IF9iLmRhdGE7XHJcbiAgICAgIC8vIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQoKTtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IGEwMDogbnVtYmVyID0gYVswICogNCArIDBdO1xyXG4gICAgICBsZXQgYTAxOiBudW1iZXIgPSBhWzAgKiA0ICsgMV07XHJcbiAgICAgIGxldCBhMDI6IG51bWJlciA9IGFbMCAqIDQgKyAyXTtcclxuICAgICAgbGV0IGEwMzogbnVtYmVyID0gYVswICogNCArIDNdO1xyXG4gICAgICBsZXQgYTEwOiBudW1iZXIgPSBhWzEgKiA0ICsgMF07XHJcbiAgICAgIGxldCBhMTE6IG51bWJlciA9IGFbMSAqIDQgKyAxXTtcclxuICAgICAgbGV0IGExMjogbnVtYmVyID0gYVsxICogNCArIDJdO1xyXG4gICAgICBsZXQgYTEzOiBudW1iZXIgPSBhWzEgKiA0ICsgM107XHJcbiAgICAgIGxldCBhMjA6IG51bWJlciA9IGFbMiAqIDQgKyAwXTtcclxuICAgICAgbGV0IGEyMTogbnVtYmVyID0gYVsyICogNCArIDFdO1xyXG4gICAgICBsZXQgYTIyOiBudW1iZXIgPSBhWzIgKiA0ICsgMl07XHJcbiAgICAgIGxldCBhMjM6IG51bWJlciA9IGFbMiAqIDQgKyAzXTtcclxuICAgICAgbGV0IGEzMDogbnVtYmVyID0gYVszICogNCArIDBdO1xyXG4gICAgICBsZXQgYTMxOiBudW1iZXIgPSBhWzMgKiA0ICsgMV07XHJcbiAgICAgIGxldCBhMzI6IG51bWJlciA9IGFbMyAqIDQgKyAyXTtcclxuICAgICAgbGV0IGEzMzogbnVtYmVyID0gYVszICogNCArIDNdO1xyXG4gICAgICBsZXQgYjAwOiBudW1iZXIgPSBiWzAgKiA0ICsgMF07XHJcbiAgICAgIGxldCBiMDE6IG51bWJlciA9IGJbMCAqIDQgKyAxXTtcclxuICAgICAgbGV0IGIwMjogbnVtYmVyID0gYlswICogNCArIDJdO1xyXG4gICAgICBsZXQgYjAzOiBudW1iZXIgPSBiWzAgKiA0ICsgM107XHJcbiAgICAgIGxldCBiMTA6IG51bWJlciA9IGJbMSAqIDQgKyAwXTtcclxuICAgICAgbGV0IGIxMTogbnVtYmVyID0gYlsxICogNCArIDFdO1xyXG4gICAgICBsZXQgYjEyOiBudW1iZXIgPSBiWzEgKiA0ICsgMl07XHJcbiAgICAgIGxldCBiMTM6IG51bWJlciA9IGJbMSAqIDQgKyAzXTtcclxuICAgICAgbGV0IGIyMDogbnVtYmVyID0gYlsyICogNCArIDBdO1xyXG4gICAgICBsZXQgYjIxOiBudW1iZXIgPSBiWzIgKiA0ICsgMV07XHJcbiAgICAgIGxldCBiMjI6IG51bWJlciA9IGJbMiAqIDQgKyAyXTtcclxuICAgICAgbGV0IGIyMzogbnVtYmVyID0gYlsyICogNCArIDNdO1xyXG4gICAgICBsZXQgYjMwOiBudW1iZXIgPSBiWzMgKiA0ICsgMF07XHJcbiAgICAgIGxldCBiMzE6IG51bWJlciA9IGJbMyAqIDQgKyAxXTtcclxuICAgICAgbGV0IGIzMjogbnVtYmVyID0gYlszICogNCArIDJdO1xyXG4gICAgICBsZXQgYjMzOiBudW1iZXIgPSBiWzMgKiA0ICsgM107XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChcclxuICAgICAgICBbXHJcbiAgICAgICAgICBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjAgKyBiMDMgKiBhMzAsXHJcbiAgICAgICAgICBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjEgKyBiMDMgKiBhMzEsXHJcbiAgICAgICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIgKyBiMDMgKiBhMzIsXHJcbiAgICAgICAgICBiMDAgKiBhMDMgKyBiMDEgKiBhMTMgKyBiMDIgKiBhMjMgKyBiMDMgKiBhMzMsXHJcbiAgICAgICAgICBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjAgKyBiMTMgKiBhMzAsXHJcbiAgICAgICAgICBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjEgKyBiMTMgKiBhMzEsXHJcbiAgICAgICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIgKyBiMTMgKiBhMzIsXHJcbiAgICAgICAgICBiMTAgKiBhMDMgKyBiMTEgKiBhMTMgKyBiMTIgKiBhMjMgKyBiMTMgKiBhMzMsXHJcbiAgICAgICAgICBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAgKyBiMjMgKiBhMzAsXHJcbiAgICAgICAgICBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEgKyBiMjMgKiBhMzEsXHJcbiAgICAgICAgICBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjIgKyBiMjMgKiBhMzIsXHJcbiAgICAgICAgICBiMjAgKiBhMDMgKyBiMjEgKiBhMTMgKyBiMjIgKiBhMjMgKyBiMjMgKiBhMzMsXHJcbiAgICAgICAgICBiMzAgKiBhMDAgKyBiMzEgKiBhMTAgKyBiMzIgKiBhMjAgKyBiMzMgKiBhMzAsXHJcbiAgICAgICAgICBiMzAgKiBhMDEgKyBiMzEgKiBhMTEgKyBiMzIgKiBhMjEgKyBiMzMgKiBhMzEsXHJcbiAgICAgICAgICBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzIsXHJcbiAgICAgICAgICBiMzAgKiBhMDMgKyBiMzEgKiBhMTMgKyBiMzIgKiBhMjMgKyBiMzMgKiBhMzNcclxuICAgICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIGFuZCByZXR1cm5zIHRoZSBpbnZlcnNlIG9mIGEgcGFzc2VkIG1hdHJpeC5cclxuICAgICAqIEBwYXJhbSBfbWF0cml4IFRoZSBtYXRyaXggdG8gY29tcHV0ZSB0aGUgaW52ZXJzZSBvZi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBJTlZFUlNJT04oX21hdHJpeDogTWF0cml4NHg0KTogTWF0cml4NHg0IHtcclxuICAgICAgbGV0IG06IEZsb2F0MzJBcnJheSA9IF9tYXRyaXguZGF0YTtcclxuICAgICAgbGV0IG0wMDogbnVtYmVyID0gbVswICogNCArIDBdO1xyXG4gICAgICBsZXQgbTAxOiBudW1iZXIgPSBtWzAgKiA0ICsgMV07XHJcbiAgICAgIGxldCBtMDI6IG51bWJlciA9IG1bMCAqIDQgKyAyXTtcclxuICAgICAgbGV0IG0wMzogbnVtYmVyID0gbVswICogNCArIDNdO1xyXG4gICAgICBsZXQgbTEwOiBudW1iZXIgPSBtWzEgKiA0ICsgMF07XHJcbiAgICAgIGxldCBtMTE6IG51bWJlciA9IG1bMSAqIDQgKyAxXTtcclxuICAgICAgbGV0IG0xMjogbnVtYmVyID0gbVsxICogNCArIDJdO1xyXG4gICAgICBsZXQgbTEzOiBudW1iZXIgPSBtWzEgKiA0ICsgM107XHJcbiAgICAgIGxldCBtMjA6IG51bWJlciA9IG1bMiAqIDQgKyAwXTtcclxuICAgICAgbGV0IG0yMTogbnVtYmVyID0gbVsyICogNCArIDFdO1xyXG4gICAgICBsZXQgbTIyOiBudW1iZXIgPSBtWzIgKiA0ICsgMl07XHJcbiAgICAgIGxldCBtMjM6IG51bWJlciA9IG1bMiAqIDQgKyAzXTtcclxuICAgICAgbGV0IG0zMDogbnVtYmVyID0gbVszICogNCArIDBdO1xyXG4gICAgICBsZXQgbTMxOiBudW1iZXIgPSBtWzMgKiA0ICsgMV07XHJcbiAgICAgIGxldCBtMzI6IG51bWJlciA9IG1bMyAqIDQgKyAyXTtcclxuICAgICAgbGV0IG0zMzogbnVtYmVyID0gbVszICogNCArIDNdO1xyXG4gICAgICBsZXQgdG1wMDogbnVtYmVyID0gbTIyICogbTMzO1xyXG4gICAgICBsZXQgdG1wMTogbnVtYmVyID0gbTMyICogbTIzO1xyXG4gICAgICBsZXQgdG1wMjogbnVtYmVyID0gbTEyICogbTMzO1xyXG4gICAgICBsZXQgdG1wMzogbnVtYmVyID0gbTMyICogbTEzO1xyXG4gICAgICBsZXQgdG1wNDogbnVtYmVyID0gbTEyICogbTIzO1xyXG4gICAgICBsZXQgdG1wNTogbnVtYmVyID0gbTIyICogbTEzO1xyXG4gICAgICBsZXQgdG1wNjogbnVtYmVyID0gbTAyICogbTMzO1xyXG4gICAgICBsZXQgdG1wNzogbnVtYmVyID0gbTMyICogbTAzO1xyXG4gICAgICBsZXQgdG1wODogbnVtYmVyID0gbTAyICogbTIzO1xyXG4gICAgICBsZXQgdG1wOTogbnVtYmVyID0gbTIyICogbTAzO1xyXG4gICAgICBsZXQgdG1wMTA6IG51bWJlciA9IG0wMiAqIG0xMztcclxuICAgICAgbGV0IHRtcDExOiBudW1iZXIgPSBtMTIgKiBtMDM7XHJcbiAgICAgIGxldCB0bXAxMjogbnVtYmVyID0gbTIwICogbTMxO1xyXG4gICAgICBsZXQgdG1wMTM6IG51bWJlciA9IG0zMCAqIG0yMTtcclxuICAgICAgbGV0IHRtcDE0OiBudW1iZXIgPSBtMTAgKiBtMzE7XHJcbiAgICAgIGxldCB0bXAxNTogbnVtYmVyID0gbTMwICogbTExO1xyXG4gICAgICBsZXQgdG1wMTY6IG51bWJlciA9IG0xMCAqIG0yMTtcclxuICAgICAgbGV0IHRtcDE3OiBudW1iZXIgPSBtMjAgKiBtMTE7XHJcbiAgICAgIGxldCB0bXAxODogbnVtYmVyID0gbTAwICogbTMxO1xyXG4gICAgICBsZXQgdG1wMTk6IG51bWJlciA9IG0zMCAqIG0wMTtcclxuICAgICAgbGV0IHRtcDIwOiBudW1iZXIgPSBtMDAgKiBtMjE7XHJcbiAgICAgIGxldCB0bXAyMTogbnVtYmVyID0gbTIwICogbTAxO1xyXG4gICAgICBsZXQgdG1wMjI6IG51bWJlciA9IG0wMCAqIG0xMTtcclxuICAgICAgbGV0IHRtcDIzOiBudW1iZXIgPSBtMTAgKiBtMDE7XHJcblxyXG4gICAgICBsZXQgdDA6IG51bWJlciA9ICh0bXAwICogbTExICsgdG1wMyAqIG0yMSArIHRtcDQgKiBtMzEpIC1cclxuICAgICAgICAodG1wMSAqIG0xMSArIHRtcDIgKiBtMjEgKyB0bXA1ICogbTMxKTtcclxuXHJcbiAgICAgIGxldCB0MTogbnVtYmVyID0gKHRtcDEgKiBtMDEgKyB0bXA2ICogbTIxICsgdG1wOSAqIG0zMSkgLVxyXG4gICAgICAgICh0bXAwICogbTAxICsgdG1wNyAqIG0yMSArIHRtcDggKiBtMzEpO1xyXG4gICAgICBsZXQgdDI6IG51bWJlciA9ICh0bXAyICogbTAxICsgdG1wNyAqIG0xMSArIHRtcDEwICogbTMxKSAtXHJcbiAgICAgICAgKHRtcDMgKiBtMDEgKyB0bXA2ICogbTExICsgdG1wMTEgKiBtMzEpO1xyXG4gICAgICBsZXQgdDM6IG51bWJlciA9ICh0bXA1ICogbTAxICsgdG1wOCAqIG0xMSArIHRtcDExICogbTIxKSAtXHJcbiAgICAgICAgKHRtcDQgKiBtMDEgKyB0bXA5ICogbTExICsgdG1wMTAgKiBtMjEpO1xyXG5cclxuICAgICAgbGV0IGQ6IG51bWJlciA9IDEuMCAvIChtMDAgKiB0MCArIG0xMCAqIHQxICsgbTIwICogdDIgKyBtMzAgKiB0Myk7XHJcblxyXG4gICAgICAvLyBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIGQgKiB0MCwgLy8gWzBdXHJcbiAgICAgICAgZCAqIHQxLCAvLyBbMV1cclxuICAgICAgICBkICogdDIsIC8vIFsyXVxyXG4gICAgICAgIGQgKiB0MywgLy8gWzNdXHJcbiAgICAgICAgZCAqICgodG1wMSAqIG0xMCArIHRtcDIgKiBtMjAgKyB0bXA1ICogbTMwKSAtICh0bXAwICogbTEwICsgdG1wMyAqIG0yMCArIHRtcDQgKiBtMzApKSwgICAgICAgIC8vIFs0XVxyXG4gICAgICAgIGQgKiAoKHRtcDAgKiBtMDAgKyB0bXA3ICogbTIwICsgdG1wOCAqIG0zMCkgLSAodG1wMSAqIG0wMCArIHRtcDYgKiBtMjAgKyB0bXA5ICogbTMwKSksICAgICAgICAvLyBbNV1cclxuICAgICAgICBkICogKCh0bXAzICogbTAwICsgdG1wNiAqIG0xMCArIHRtcDExICogbTMwKSAtICh0bXAyICogbTAwICsgdG1wNyAqIG0xMCArIHRtcDEwICogbTMwKSksICAgICAgLy8gWzZdXHJcbiAgICAgICAgZCAqICgodG1wNCAqIG0wMCArIHRtcDkgKiBtMTAgKyB0bXAxMCAqIG0yMCkgLSAodG1wNSAqIG0wMCArIHRtcDggKiBtMTAgKyB0bXAxMSAqIG0yMCkpLCAgICAgIC8vIFs3XVxyXG4gICAgICAgIGQgKiAoKHRtcDEyICogbTEzICsgdG1wMTUgKiBtMjMgKyB0bXAxNiAqIG0zMykgLSAodG1wMTMgKiBtMTMgKyB0bXAxNCAqIG0yMyArIHRtcDE3ICogbTMzKSksICAvLyBbOF1cclxuICAgICAgICBkICogKCh0bXAxMyAqIG0wMyArIHRtcDE4ICogbTIzICsgdG1wMjEgKiBtMzMpIC0gKHRtcDEyICogbTAzICsgdG1wMTkgKiBtMjMgKyB0bXAyMCAqIG0zMykpLCAgLy8gWzldXHJcbiAgICAgICAgZCAqICgodG1wMTQgKiBtMDMgKyB0bXAxOSAqIG0xMyArIHRtcDIyICogbTMzKSAtICh0bXAxNSAqIG0wMyArIHRtcDE4ICogbTEzICsgdG1wMjMgKiBtMzMpKSwgIC8vIFsxMF1cclxuICAgICAgICBkICogKCh0bXAxNyAqIG0wMyArIHRtcDIwICogbTEzICsgdG1wMjMgKiBtMjMpIC0gKHRtcDE2ICogbTAzICsgdG1wMjEgKiBtMTMgKyB0bXAyMiAqIG0yMykpLCAgLy8gWzExXVxyXG4gICAgICAgIGQgKiAoKHRtcDE0ICogbTIyICsgdG1wMTcgKiBtMzIgKyB0bXAxMyAqIG0xMikgLSAodG1wMTYgKiBtMzIgKyB0bXAxMiAqIG0xMiArIHRtcDE1ICogbTIyKSksICAvLyBbMTJdXHJcbiAgICAgICAgZCAqICgodG1wMjAgKiBtMzIgKyB0bXAxMiAqIG0wMiArIHRtcDE5ICogbTIyKSAtICh0bXAxOCAqIG0yMiArIHRtcDIxICogbTMyICsgdG1wMTMgKiBtMDIpKSwgIC8vIFsxM11cclxuICAgICAgICBkICogKCh0bXAxOCAqIG0xMiArIHRtcDIzICogbTMyICsgdG1wMTUgKiBtMDIpIC0gKHRtcDIyICogbTMyICsgdG1wMTQgKiBtMDIgKyB0bXAxOSAqIG0xMikpLCAgLy8gWzE0XVxyXG4gICAgICAgIGQgKiAoKHRtcDIyICogbTIyICsgdG1wMTYgKiBtMDIgKyB0bXAyMSAqIG0xMikgLSAodG1wMjAgKiBtMTIgKyB0bXAyMyAqIG0yMiArIHRtcDE3ICogbTAyKSkgIC8vIFsxNV1cclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyBhbmQgcmV0dXJucyBhIHJvdGF0aW9ubWF0cml4IHRoYXQgYWxpZ25zIGEgdHJhbnNmb3JtYXRpb25zIHotYXhpcyB3aXRoIHRoZSB2ZWN0b3IgYmV0d2VlbiBpdCBhbmQgaXRzIHRhcmdldC5cclxuICAgICAqIEBwYXJhbSBfdHJhbnNmb3JtUG9zaXRpb24gVGhlIHgseSBhbmQgei1jb29yZGluYXRlcyBvZiB0aGUgb2JqZWN0IHRvIHJvdGF0ZS5cclxuICAgICAqIEBwYXJhbSBfdGFyZ2V0UG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIGxvb2sgYXQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTE9PS19BVChfdHJhbnNmb3JtUG9zaXRpb246IFZlY3RvcjMsIF90YXJnZXRQb3NpdGlvbjogVmVjdG9yMywgX3VwOiBWZWN0b3IzID0gVmVjdG9yMy5ZKCkpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIGxldCB6QXhpczogVmVjdG9yMyA9IFZlY3RvcjMuRElGRkVSRU5DRShfdHJhbnNmb3JtUG9zaXRpb24sIF90YXJnZXRQb3NpdGlvbik7XHJcbiAgICAgIHpBeGlzLm5vcm1hbGl6ZSgpO1xyXG4gICAgICBsZXQgeEF4aXM6IFZlY3RvcjMgPSBWZWN0b3IzLk5PUk1BTElaQVRJT04oVmVjdG9yMy5DUk9TUyhfdXAsIHpBeGlzKSk7XHJcbiAgICAgIGxldCB5QXhpczogVmVjdG9yMyA9IFZlY3RvcjMuTk9STUFMSVpBVElPTihWZWN0b3IzLkNST1NTKHpBeGlzLCB4QXhpcykpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgeEF4aXMueCwgeEF4aXMueSwgeEF4aXMueiwgMCxcclxuICAgICAgICAgIHlBeGlzLngsIHlBeGlzLnksIHlBeGlzLnosIDAsXHJcbiAgICAgICAgICB6QXhpcy54LCB6QXhpcy55LCB6QXhpcy56LCAwLFxyXG4gICAgICAgICAgX3RyYW5zZm9ybVBvc2l0aW9uLngsXHJcbiAgICAgICAgICBfdHJhbnNmb3JtUG9zaXRpb24ueSxcclxuICAgICAgICAgIF90cmFuc2Zvcm1Qb3NpdGlvbi56LFxyXG4gICAgICAgICAgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHRyYW5zbGF0ZXMgY29vcmRpbmF0ZXMgYWxvbmcgdGhlIHgtLCB5LSBhbmQgei1heGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFRSQU5TTEFUSU9OKF90cmFuc2xhdGU6IFZlY3RvcjMpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgIF90cmFuc2xhdGUueCwgX3RyYW5zbGF0ZS55LCBfdHJhbnNsYXRlLnosIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgcm90YXRlcyBjb29yZGluYXRlcyBvbiB0aGUgeC1heGlzIHdoZW4gbXVsdGlwbGllZCBieS5cclxuICAgICAqIEBwYXJhbSBfYW5nbGVJbkRlZ3JlZXMgVGhlIHZhbHVlIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBST1RBVElPTl9YKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBsZXQgYW5nbGVJblJhZGlhbnM6IG51bWJlciA9IF9hbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgICAgIGxldCBzaW46IG51bWJlciA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbGV0IGNvczogbnVtYmVyID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgY29zLCBzaW4sIDAsXHJcbiAgICAgICAgMCwgLXNpbiwgY29zLCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgcm90YXRlcyBjb29yZGluYXRlcyBvbiB0aGUgeS1heGlzIHdoZW4gbXVsdGlwbGllZCBieS5cclxuICAgICAqIEBwYXJhbSBfYW5nbGVJbkRlZ3JlZXMgVGhlIHZhbHVlIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBST1RBVElPTl9ZKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IGFuZ2xlSW5SYWRpYW5zOiBudW1iZXIgPSBfYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICBsZXQgc2luOiBudW1iZXIgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIGxldCBjb3M6IG51bWJlciA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICBjb3MsIDAsIC1zaW4sIDAsXHJcbiAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICBzaW4sIDAsIGNvcywgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHJvdGF0ZXMgY29vcmRpbmF0ZXMgb24gdGhlIHotYXhpcyB3aGVuIG11bHRpcGxpZWQgYnkuXHJcbiAgICAgKiBAcGFyYW0gX2FuZ2xlSW5EZWdyZWVzIFRoZSB2YWx1ZSBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgUk9UQVRJT05fWihfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IGFuZ2xlSW5SYWRpYW5zOiBudW1iZXIgPSBfYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICBsZXQgc2luOiBudW1iZXIgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIGxldCBjb3M6IG51bWJlciA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICBjb3MsIHNpbiwgMCwgMCxcclxuICAgICAgICAtc2luLCBjb3MsIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHNjYWxlcyBjb29yZGluYXRlcyBhbG9uZyB0aGUgeC0sIHktIGFuZCB6LWF4aXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiB2ZWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBTQ0FMSU5HKF9zY2FsYXI6IFZlY3RvcjMpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgX3NjYWxhci54LCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIF9zY2FsYXIueSwgMCwgMCxcclxuICAgICAgICAwLCAwLCBfc2NhbGFyLnosIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBQUk9KRUNUSU9OU1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyBhbmQgcmV0dXJucyBhIG1hdHJpeCB0aGF0IGFwcGxpZXMgcGVyc3BlY3RpdmUgdG8gYW4gb2JqZWN0LCBpZiBpdHMgdHJhbnNmb3JtIGlzIG11bHRpcGxpZWQgYnkgaXQuXHJcbiAgICAgKiBAcGFyYW0gX2FzcGVjdCBUaGUgYXNwZWN0IHJhdGlvIGJldHdlZW4gd2lkdGggYW5kIGhlaWdodCBvZiBwcm9qZWN0aW9uc3BhY2UuKERlZmF1bHQgPSBjYW52YXMuY2xpZW50V2lkdGggLyBjYW52YXMuQ2xpZW50SGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIF9maWVsZE9mVmlld0luRGVncmVlcyBUaGUgZmllbGQgb2YgdmlldyBpbiBEZWdyZWVzLiAoRGVmYXVsdCA9IDQ1KVxyXG4gICAgICogQHBhcmFtIF9uZWFyIFRoZSBuZWFyIGNsaXBzcGFjZSBib3JkZXIgb24gdGhlIHotYXhpcy5cclxuICAgICAqIEBwYXJhbSBfZmFyIFRoZSBmYXIgY2xpcHNwYWNlIGJvcmRlciBvbiB0aGUgei1heGlzLlxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIHBsYW5lIG9uIHdoaWNoIHRoZSBmaWVsZE9mVmlldy1BbmdsZSBpcyBnaXZlbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBQUk9KRUNUSU9OX0NFTlRSQUwoX2FzcGVjdDogbnVtYmVyLCBfZmllbGRPZlZpZXdJbkRlZ3JlZXM6IG51bWJlciwgX25lYXI6IG51bWJlciwgX2ZhcjogbnVtYmVyLCBfZGlyZWN0aW9uOiBGSUVMRF9PRl9WSUVXKTogTWF0cml4NHg0IHtcclxuICAgICAgbGV0IGZpZWxkT2ZWaWV3SW5SYWRpYW5zOiBudW1iZXIgPSBfZmllbGRPZlZpZXdJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICBsZXQgZjogbnVtYmVyID0gTWF0aC50YW4oMC41ICogKE1hdGguUEkgLSBmaWVsZE9mVmlld0luUmFkaWFucykpO1xyXG4gICAgICBsZXQgcmFuZ2VJbnY6IG51bWJlciA9IDEuMCAvIChfbmVhciAtIF9mYXIpO1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgZiwgMCwgMCwgMCxcclxuICAgICAgICAwLCBmLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIChfbmVhciArIF9mYXIpICogcmFuZ2VJbnYsIC0xLFxyXG4gICAgICAgIDAsIDAsIF9uZWFyICogX2ZhciAqIHJhbmdlSW52ICogMiwgMFxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgIGlmIChfZGlyZWN0aW9uID09IEZJRUxEX09GX1ZJRVcuRElBR09OQUwpIHtcclxuICAgICAgICBfYXNwZWN0ID0gTWF0aC5zcXJ0KF9hc3BlY3QpO1xyXG4gICAgICAgIG1hdHJpeC5kYXRhWzBdID0gZiAvIF9hc3BlY3Q7XHJcbiAgICAgICAgbWF0cml4LmRhdGFbNV0gPSBmICogX2FzcGVjdDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChfZGlyZWN0aW9uID09IEZJRUxEX09GX1ZJRVcuVkVSVElDQUwpXHJcbiAgICAgICAgbWF0cml4LmRhdGFbMF0gPSBmIC8gX2FzcGVjdDtcclxuICAgICAgZWxzZSAvL0ZPVl9ESVJFQ1RJT04uSE9SSVpPTlRBTFxyXG4gICAgICAgIG1hdHJpeC5kYXRhWzVdID0gZiAqIF9hc3BlY3Q7XHJcblxyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tcHV0ZXMgYW5kIHJldHVybnMgYSBtYXRyaXggdGhhdCBhcHBsaWVzIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uIHRvIGFuIG9iamVjdCwgaWYgaXRzIHRyYW5zZm9ybSBpcyBtdWx0aXBsaWVkIGJ5IGl0LlxyXG4gICAgICogQHBhcmFtIF9sZWZ0IFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBsZWZ0IGJvcmRlci5cclxuICAgICAqIEBwYXJhbSBfcmlnaHQgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIHJpZ2h0IGJvcmRlci5cclxuICAgICAqIEBwYXJhbSBfYm90dG9tIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBib3R0b20gYm9yZGVyLlxyXG4gICAgICogQHBhcmFtIF90b3AgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIHRvcCBib3JkZXIuXHJcbiAgICAgKiBAcGFyYW0gX25lYXIgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIG5lYXIgYm9yZGVyLlxyXG4gICAgICogQHBhcmFtIF9mYXIgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIGZhciBib3JkZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBQUk9KRUNUSU9OX09SVEhPR1JBUEhJQyhfbGVmdDogbnVtYmVyLCBfcmlnaHQ6IG51bWJlciwgX2JvdHRvbTogbnVtYmVyLCBfdG9wOiBudW1iZXIsIF9uZWFyOiBudW1iZXIgPSAtNDAwLCBfZmFyOiBudW1iZXIgPSA0MDApOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgMiAvIChfcmlnaHQgLSBfbGVmdCksIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgMiAvIChfdG9wIC0gX2JvdHRvbSksIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgMiAvIChfbmVhciAtIF9mYXIpLCAwLFxyXG4gICAgICAgIChfbGVmdCArIF9yaWdodCkgLyAoX2xlZnQgLSBfcmlnaHQpLFxyXG4gICAgICAgIChfYm90dG9tICsgX3RvcCkgLyAoX2JvdHRvbSAtIF90b3ApLFxyXG4gICAgICAgIChfbmVhciArIF9mYXIpIC8gKF9uZWFyIC0gX2ZhciksXHJcbiAgICAgICAgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBSb3RhdGlvblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgcm90YXRpb24gYXJvdW5kIHRoZSB4LUF4aXMgdG8gdGhpcyBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJvdGF0ZVgoX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlJPVEFUSU9OX1goX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgcm90YXRpb24gYXJvdW5kIHRoZSB5LUF4aXMgdG8gdGhpcyBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJvdGF0ZVkoX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlJPVEFUSU9OX1koX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgcm90YXRpb24gYXJvdW5kIHRoZSB6LUF4aXMgdG8gdGhpcyBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJvdGF0ZVooX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlJPVEFUSU9OX1ooX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGp1c3RzIHRoZSByb3RhdGlvbiBvZiB0aGlzIG1hdHJpeCB0byBmYWNlIHRoZSBnaXZlbiB0YXJnZXQgYW5kIHRpbHRzIGl0IHRvIGFjY29yZCB3aXRoIHRoZSBnaXZlbiB1cCB2ZWN0b3IgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb29rQXQoX3RhcmdldDogVmVjdG9yMywgX3VwOiBWZWN0b3IzID0gVmVjdG9yMy5ZKCkpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTE9PS19BVCh0aGlzLnRyYW5zbGF0aW9uLCBfdGFyZ2V0KTsgLy8gVE9ETzogSGFuZGxlIHJvdGF0aW9uIGFyb3VuZCB6LWF4aXNcclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBUcmFuc2xhdGlvblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSB0cmFuc2xhdGlvbiBieSB0aGUgZ2l2ZW4gdmVjdG9yIHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKF9ieTogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLCBNYXRyaXg0eDQuVFJBTlNMQVRJT04oX2J5KSk7XHJcbiAgICAgIC8vIFRPRE86IHBvc3NpYmxlIG9wdGltaXphdGlvbiwgdHJhbnNsYXRpb24gbWF5IGFsdGVyIG11dGF0b3IgaW5zdGVhZCBvZiBkZWxldGluZyBpdC5cclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHRyYW5zbGF0aW9uIGFsb25nIHRoZSB4LUF4aXMgYnkgdGhlIGdpdmVuIGFtb3VudCB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRyYW5zbGF0ZVgoX3g6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGFbMTJdICs9IF94O1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSB0cmFuc2xhdGlvbiBhbG9uZyB0aGUgeS1BeGlzIGJ5IHRoZSBnaXZlbiBhbW91bnQgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0cmFuc2xhdGVZKF95OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhWzEzXSArPSBfeTtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgdHJhbnNsYXRpb24gYWxvbmcgdGhlIHktQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlWihfejogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YVsxNF0gKz0gX3o7XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gU2NhbGluZ1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBzY2FsaW5nIGJ5IHRoZSBnaXZlbiB2ZWN0b3IgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzY2FsZShfYnk6IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlNDQUxJTkcoX2J5KSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHNjYWxpbmcgYWxvbmcgdGhlIHgtQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGVYKF9ieTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc2NhbGUobmV3IFZlY3RvcjMoX2J5LCAxLCAxKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHNjYWxpbmcgYWxvbmcgdGhlIHktQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGVZKF9ieTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc2NhbGUobmV3IFZlY3RvcjMoMSwgX2J5LCAxKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHNjYWxpbmcgYWxvbmcgdGhlIHotQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGVaKF9ieTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc2NhbGUobmV3IFZlY3RvcjMoMSwgMSwgX2J5KSk7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gVHJhbnNmb3JtYXRpb25cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbHkgdGhpcyBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtdWx0aXBseShfbWF0cml4OiBNYXRyaXg0eDQpOiB2b2lkIHtcclxuICAgICAgdGhpcy5zZXQoTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMsIF9tYXRyaXgpKTtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBldWxlci1hbmdsZXMgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IHJvdGF0aW9uIG9mIHRoaXMgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRFdWxlckFuZ2xlcygpOiBWZWN0b3IzIHtcclxuICAgICAgbGV0IHNjYWxpbmc6IFZlY3RvcjMgPSB0aGlzLnNjYWxpbmc7XHJcblxyXG4gICAgICBsZXQgczA6IG51bWJlciA9IHRoaXMuZGF0YVswXSAvIHNjYWxpbmcueDtcclxuICAgICAgbGV0IHMxOiBudW1iZXIgPSB0aGlzLmRhdGFbMV0gLyBzY2FsaW5nLng7XHJcbiAgICAgIGxldCBzMjogbnVtYmVyID0gdGhpcy5kYXRhWzJdIC8gc2NhbGluZy54O1xyXG4gICAgICBsZXQgczY6IG51bWJlciA9IHRoaXMuZGF0YVs2XSAvIHNjYWxpbmcueTtcclxuICAgICAgbGV0IHMxMDogbnVtYmVyID0gdGhpcy5kYXRhWzEwXSAvIHNjYWxpbmcuejtcclxuXHJcbiAgICAgIGxldCBzeTogbnVtYmVyID0gTWF0aC5oeXBvdChzMCwgczEpOyAvLyBwcm9iYWJseSAyLiBwYXJhbSBzaG91bGQgYmUgdGhpcy5kYXRhWzRdIC8gc2NhbGluZy55XHJcblxyXG4gICAgICBsZXQgc2luZ3VsYXI6IGJvb2xlYW4gPSBzeSA8IDFlLTY7IC8vIElmXHJcblxyXG4gICAgICBsZXQgeDE6IG51bWJlciwgeTE6IG51bWJlciwgejE6IG51bWJlcjtcclxuICAgICAgbGV0IHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHoyOiBudW1iZXI7XHJcblxyXG4gICAgICBpZiAoIXNpbmd1bGFyKSB7XHJcbiAgICAgICAgeDEgPSBNYXRoLmF0YW4yKHM2LCBzMTApO1xyXG4gICAgICAgIHkxID0gTWF0aC5hdGFuMigtczIsIHN5KTtcclxuICAgICAgICB6MSA9IE1hdGguYXRhbjIoczEsIHMwKTtcclxuXHJcbiAgICAgICAgeDIgPSBNYXRoLmF0YW4yKC1zNiwgLXMxMCk7XHJcbiAgICAgICAgeTIgPSBNYXRoLmF0YW4yKC1zMiwgLXN5KTtcclxuICAgICAgICB6MiA9IE1hdGguYXRhbjIoLXMxLCAtczApO1xyXG5cclxuICAgICAgICBpZiAoTWF0aC5hYnMoeDIpICsgTWF0aC5hYnMoeTIpICsgTWF0aC5hYnMoejIpIDwgTWF0aC5hYnMoeDEpICsgTWF0aC5hYnMoeTEpICsgTWF0aC5hYnMoejEpKSB7XHJcbiAgICAgICAgICB4MSA9IHgyO1xyXG4gICAgICAgICAgeTEgPSB5MjtcclxuICAgICAgICAgIHoxID0gejI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHgxID0gTWF0aC5hdGFuMigtdGhpcy5kYXRhWzldIC8gc2NhbGluZy56LCB0aGlzLmRhdGFbNV0gLyBzY2FsaW5nLnkpO1xyXG4gICAgICAgIHkxID0gTWF0aC5hdGFuMigtdGhpcy5kYXRhWzJdIC8gc2NhbGluZy54LCBzeSk7XHJcbiAgICAgICAgejEgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgcm90YXRpb246IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyh4MSwgeTEsIHoxKTtcclxuICAgICAgcm90YXRpb24uc2NhbGUoMTgwIC8gTWF0aC5QSSk7XHJcblxyXG4gICAgICByZXR1cm4gcm90YXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBlbGVtZW50cyBvZiB0aGlzIG1hdHJpeCB0byB0aGUgdmFsdWVzIG9mIHRoZSBnaXZlbiBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldChfdG86IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAvLyB0aGlzLmRhdGEgPSBfdG8uZ2V0KCk7XHJcbiAgICAgIHRoaXMuZGF0YS5zZXQoX3RvLmRhdGEpO1xyXG4gICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgZWxlbWVudHMgb2YgdGhpcyBtYXRyaXggYXMgYSBGbG9hdDMyQXJyYXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCgpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIC8vIFRPRE86IHNhdmUgdHJhbnNsYXRpb24sIHJvdGF0aW9uIGFuZCBzY2FsZSBhcyB2ZWN0b3JzIGZvciByZWFkYWJpbGl0eSBhbmQgbWFuaXB1bGF0aW9uXHJcbiAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gdGhpcy5nZXRNdXRhdG9yKCk7XHJcbiAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgdGhpcy5tdXRhdGUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgaWYgKHRoaXMubXV0YXRvcilcclxuICAgICAgICByZXR1cm4gdGhpcy5tdXRhdG9yO1xyXG5cclxuICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7XHJcbiAgICAgICAgdHJhbnNsYXRpb246IHRoaXMudHJhbnNsYXRpb24uZ2V0TXV0YXRvcigpLFxyXG4gICAgICAgIHJvdGF0aW9uOiB0aGlzLnJvdGF0aW9uLmdldE11dGF0b3IoKSxcclxuICAgICAgICBzY2FsaW5nOiB0aGlzLnNjYWxpbmcuZ2V0TXV0YXRvcigpXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBjYWNoZSBtdXRhdG9yXHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG11dGF0b3I7XHJcbiAgICAgIHJldHVybiBtdXRhdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtdXRhdGUoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgbGV0IG9sZFRyYW5zbGF0aW9uOiBWZWN0b3IzID0gdGhpcy50cmFuc2xhdGlvbjtcclxuICAgICAgbGV0IG9sZFJvdGF0aW9uOiBWZWN0b3IzID0gdGhpcy5yb3RhdGlvbjtcclxuICAgICAgbGV0IG9sZFNjYWxpbmc6IFZlY3RvcjMgPSB0aGlzLnNjYWxpbmc7XHJcbiAgICAgIGxldCBuZXdUcmFuc2xhdGlvbjogVmVjdG9yMyA9IDxWZWN0b3IzPl9tdXRhdG9yW1widHJhbnNsYXRpb25cIl07XHJcbiAgICAgIGxldCBuZXdSb3RhdGlvbjogVmVjdG9yMyA9IDxWZWN0b3IzPl9tdXRhdG9yW1wicm90YXRpb25cIl07XHJcbiAgICAgIGxldCBuZXdTY2FsaW5nOiBWZWN0b3IzID0gPFZlY3RvcjM+X211dGF0b3JbXCJzY2FsaW5nXCJdO1xyXG4gICAgICBsZXQgdmVjdG9yczogVmVjdG9yUmVwcmVzZW50YXRpb24gPSB7IHRyYW5zbGF0aW9uOiBudWxsLCByb3RhdGlvbjogbnVsbCwgc2NhbGluZzogbnVsbCB9O1xyXG4gICAgICBpZiAobmV3VHJhbnNsYXRpb24pIHtcclxuICAgICAgICB2ZWN0b3JzLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjMoXHJcbiAgICAgICAgICBuZXdUcmFuc2xhdGlvbi54ICE9IHVuZGVmaW5lZCA/IG5ld1RyYW5zbGF0aW9uLnggOiBvbGRUcmFuc2xhdGlvbi54LFxyXG4gICAgICAgICAgbmV3VHJhbnNsYXRpb24ueSAhPSB1bmRlZmluZWQgPyBuZXdUcmFuc2xhdGlvbi55IDogb2xkVHJhbnNsYXRpb24ueSxcclxuICAgICAgICAgIG5ld1RyYW5zbGF0aW9uLnogIT0gdW5kZWZpbmVkID8gbmV3VHJhbnNsYXRpb24ueiA6IG9sZFRyYW5zbGF0aW9uLnpcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChuZXdSb3RhdGlvbikge1xyXG4gICAgICAgIHZlY3RvcnMucm90YXRpb24gPSBuZXcgVmVjdG9yMyhcclxuICAgICAgICAgIG5ld1JvdGF0aW9uLnggIT0gdW5kZWZpbmVkID8gbmV3Um90YXRpb24ueCA6IG9sZFJvdGF0aW9uLngsXHJcbiAgICAgICAgICBuZXdSb3RhdGlvbi55ICE9IHVuZGVmaW5lZCA/IG5ld1JvdGF0aW9uLnkgOiBvbGRSb3RhdGlvbi55LFxyXG4gICAgICAgICAgbmV3Um90YXRpb24ueiAhPSB1bmRlZmluZWQgPyBuZXdSb3RhdGlvbi56IDogb2xkUm90YXRpb24uelxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG5ld1NjYWxpbmcpIHtcclxuICAgICAgICB2ZWN0b3JzLnNjYWxpbmcgPSBuZXcgVmVjdG9yMyhcclxuICAgICAgICAgIG5ld1NjYWxpbmcueCAhPSB1bmRlZmluZWQgPyBuZXdTY2FsaW5nLnggOiBvbGRTY2FsaW5nLngsXHJcbiAgICAgICAgICBuZXdTY2FsaW5nLnkgIT0gdW5kZWZpbmVkID8gbmV3U2NhbGluZy55IDogb2xkU2NhbGluZy55LFxyXG4gICAgICAgICAgbmV3U2NhbGluZy56ICE9IHVuZGVmaW5lZCA/IG5ld1NjYWxpbmcueiA6IG9sZFNjYWxpbmcuelxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRPRE86IHBvc3NpYmxlIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbiB3aGVuIG9ubHkgb25lIG9yIHR3byBjb21wb25lbnRzIGNoYW5nZSwgdGhlbiB1c2Ugb2xkIG1hdHJpeCBpbnN0ZWFkIG9mIElERU5USVRZIGFuZCB0cmFuc2Zvcm0gYnkgZGlmZmVyZW5jZXMvcXVvdGllbnRzXHJcbiAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgaWYgKHZlY3RvcnMudHJhbnNsYXRpb24pXHJcbiAgICAgICAgbWF0cml4LnRyYW5zbGF0ZSh2ZWN0b3JzLnRyYW5zbGF0aW9uKTtcclxuICAgICAgaWYgKHZlY3RvcnMucm90YXRpb24pIHtcclxuICAgICAgICBtYXRyaXgucm90YXRlWih2ZWN0b3JzLnJvdGF0aW9uLnopO1xyXG4gICAgICAgIG1hdHJpeC5yb3RhdGVZKHZlY3RvcnMucm90YXRpb24ueSk7XHJcbiAgICAgICAgbWF0cml4LnJvdGF0ZVgodmVjdG9ycy5yb3RhdGlvbi54KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodmVjdG9ycy5zY2FsaW5nKVxyXG4gICAgICAgIG1hdHJpeC5zY2FsZSh2ZWN0b3JzLnNjYWxpbmcpO1xyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG5cclxuICAgICAgdGhpcy52ZWN0b3JzID0gdmVjdG9ycztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvckF0dHJpYnV0ZVR5cGVzKF9tdXRhdG9yOiBNdXRhdG9yKTogTXV0YXRvckF0dHJpYnV0ZVR5cGVzIHtcclxuICAgICAgbGV0IHR5cGVzOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMgPSB7fTtcclxuICAgICAgaWYgKF9tdXRhdG9yLnRyYW5zbGF0aW9uKSB0eXBlcy50cmFuc2xhdGlvbiA9IFwiVmVjdG9yM1wiO1xyXG4gICAgICBpZiAoX211dGF0b3Iucm90YXRpb24pIHR5cGVzLnJvdGF0aW9uID0gXCJWZWN0b3IzXCI7XHJcbiAgICAgIGlmIChfbXV0YXRvci5zY2FsaW5nKSB0eXBlcy5zY2FsaW5nID0gXCJWZWN0b3IzXCI7XHJcbiAgICAgIHJldHVybiB0eXBlcztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7LyoqICovIH1cclxuXHJcbiAgICBwcml2YXRlIHJlc2V0Q2FjaGUoKTogdm9pZCB7XHJcbiAgICAgIHRoaXMudmVjdG9ycyA9IHsgdHJhbnNsYXRpb246IG51bGwsIHJvdGF0aW9uOiBudWxsLCBzY2FsaW5nOiBudWxsIH07XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vI2VuZHJlZ2lvblxyXG59XHJcbiIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHRoZSBvcmlnaW4gb2YgYSByZWN0YW5nbGVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gT1JJR0lOMkQge1xyXG4gICAgICAgIFRPUExFRlQgPSAweDAwLFxyXG4gICAgICAgIFRPUENFTlRFUiA9IDB4MDEsXHJcbiAgICAgICAgVE9QUklHSFQgPSAweDAyLFxyXG4gICAgICAgIENFTlRFUkxFRlQgPSAweDEwLFxyXG4gICAgICAgIENFTlRFUiA9IDB4MTEsXHJcbiAgICAgICAgQ0VOVEVSUklHSFQgPSAweDEyLFxyXG4gICAgICAgIEJPVFRPTUxFRlQgPSAweDIwLFxyXG4gICAgICAgIEJPVFRPTUNFTlRFUiA9IDB4MjEsXHJcbiAgICAgICAgQk9UVE9NUklHSFQgPSAweDIyXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGEgcmVjdGFuZ2xlIHdpdGggcG9zaXRpb24gYW5kIHNpemUgYW5kIGFkZCBjb21mb3J0YWJsZSBtZXRob2RzIHRvIGl0XHJcbiAgICAgKiBAYXV0aG9yIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBNdXRhYmxlIHtcclxuICAgICAgICBwdWJsaWMgcG9zaXRpb246IFZlY3RvcjIgPSBSZWN5Y2xlci5nZXQoVmVjdG9yMik7XHJcbiAgICAgICAgcHVibGljIHNpemU6IFZlY3RvcjIgPSBSZWN5Y2xlci5nZXQoVmVjdG9yMik7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCwgX3dpZHRoOiBudW1iZXIgPSAxLCBfaGVpZ2h0OiBudW1iZXIgPSAxLCBfb3JpZ2luOiBPUklHSU4yRCA9IE9SSUdJTjJELlRPUExFRlQpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbkFuZFNpemUoX3gsIF95LCBfd2lkdGgsIF9oZWlnaHQsIF9vcmlnaW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIG5ldyByZWN0YW5nbGUgY3JlYXRlZCB3aXRoIHRoZSBnaXZlbiBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBHRVQoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfd2lkdGg6IG51bWJlciA9IDEsIF9oZWlnaHQ6IG51bWJlciA9IDEsIF9vcmlnaW46IE9SSUdJTjJEID0gT1JJR0lOMkQuVE9QTEVGVCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIGxldCByZWN0OiBSZWN0YW5nbGUgPSBSZWN5Y2xlci5nZXQoUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgcmVjdC5zZXRQb3NpdGlvbkFuZFNpemUoX3gsIF95LCBfd2lkdGgsIF9oZWlnaHQpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldHMgdGhlIHBvc2l0aW9uIGFuZCBzaXplIG9mIHRoZSByZWN0YW5nbGUgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldFBvc2l0aW9uQW5kU2l6ZShfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDAsIF93aWR0aDogbnVtYmVyID0gMSwgX2hlaWdodDogbnVtYmVyID0gMSwgX29yaWdpbjogT1JJR0lOMkQgPSBPUklHSU4yRC5UT1BMRUZUKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS5zZXQoX3dpZHRoLCBfaGVpZ2h0KTtcclxuICAgICAgICAgICAgc3dpdGNoIChfb3JpZ2luICYgMHgwMykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAweDAwOiB0aGlzLnBvc2l0aW9uLnggPSBfeDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MDE6IHRoaXMucG9zaXRpb24ueCA9IF94IC0gX3dpZHRoIC8gMjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MDI6IHRoaXMucG9zaXRpb24ueCA9IF94IC0gX3dpZHRoOyBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzd2l0Y2ggKF9vcmlnaW4gJiAweDMwKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MDA6IHRoaXMucG9zaXRpb24ueSA9IF95OyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMHgxMDogdGhpcy5wb3NpdGlvbi55ID0gX3kgLSBfaGVpZ2h0IC8gMjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MjA6IHRoaXMucG9zaXRpb24ueSA9IF95IC0gX2hlaWdodDsgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaXplLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2l6ZS55O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IGxlZnQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IHRvcCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgcmlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueCArIHRoaXMuc2l6ZS54O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgYm90dG9tKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNldCB4KF94OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gX3g7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCB5KF95OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gX3k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCB3aWR0aChfd2lkdGg6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBfd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCBoZWlnaHQoX2hlaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IF9oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCBsZWZ0KF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS54ID0gdGhpcy5yaWdodCAtIF92YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgdG9wKF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS55ID0gdGhpcy5ib3R0b20gLSBfdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IF92YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IHJpZ2h0KF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS54ID0gdGhpcy5wb3NpdGlvbi54ICsgX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgYm90dG9tKF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS55ID0gdGhpcy5wb3NpdGlvbi55ICsgX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBwb2ludCBpcyBpbnNpZGUgb2YgdGhpcyByZWN0YW5nbGUgb3Igb24gdGhlIGJvcmRlclxyXG4gICAgICAgICAqIEBwYXJhbSBfcG9pbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaXNJbnNpZGUoX3BvaW50OiBWZWN0b3IyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoX3BvaW50LnggPj0gdGhpcy5sZWZ0ICYmIF9wb2ludC54IDw9IHRoaXMucmlnaHQgJiYgX3BvaW50LnkgPj0gdGhpcy50b3AgJiYgX3BvaW50LnkgPD0gdGhpcy5ib3R0b20pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHsvKiAqLyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBTdG9yZXMgYW5kIG1hbmlwdWxhdGVzIGEgdHdvZGltZW5zaW9uYWwgdmVjdG9yIGNvbXByaXNlZCBvZiB0aGUgY29tcG9uZW50cyB4IGFuZCB5XHJcbiAgICogYGBgcGxhaW50ZXh0XHJcbiAgICogICAgICAgICAgICAreVxyXG4gICAqICAgICAgICAgICAgIHxfXyAreFxyXG4gICAqIGBgYFxyXG4gICAqIEBhdXRob3JzIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFZlY3RvcjIgZXh0ZW5kcyBNdXRhYmxlIHtcclxuICAgIHByaXZhdGUgZGF0YTogRmxvYXQzMkFycmF5O1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX3gsIF95XSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXTtcclxuICAgIH1cclxuICAgIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHgoX3g6IG51bWJlcikge1xyXG4gICAgICB0aGlzLmRhdGFbMF0gPSBfeDtcclxuICAgIH1cclxuICAgIHNldCB5KF95OiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5kYXRhWzFdID0gX3k7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKDAsIDApYC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciB3aXRoIHRoZSB2YWx1ZXMgKDAsIDApXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgWkVSTygpOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKF9zY2FsZSwgX3NjYWxlKWAuXHJcbiAgICAgKiBAcGFyYW0gX3NjYWxlIHRoZSBzY2FsZSBvZiB0aGUgdmVjdG9yLiBEZWZhdWx0OiAxXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgT05FKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoX3NjYWxlLCBfc2NhbGUpO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIEEgc2hvcnRoYW5kIGZvciB3cml0aW5nIGBuZXcgVmVjdG9yMigwLCB5KWAuXHJcbiAgICAgKiBAcGFyYW0gX3NjYWxlIFRoZSBudW1iZXIgdG8gd3JpdGUgaW4gdGhlIHkgY29vcmRpbmF0ZS4gRGVmYXVsdDogMVxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHdpdGggdGhlIHZhbHVlcyAoMCwgX3NjYWxlKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFkoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMigwLCBfc2NhbGUpO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIEEgc2hvcnRoYW5kIGZvciB3cml0aW5nIGBuZXcgVmVjdG9yMih4LCAwKWAuXHJcbiAgICAgKiBAcGFyYW0gX3NjYWxlIFRoZSBudW1iZXIgdG8gd3JpdGUgaW4gdGhlIHggY29vcmRpbmF0ZS4gRGVmYXVsdDogMVxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHdpdGggdGhlIHZhbHVlcyAoX3NjYWxlLCAwKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFgoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihfc2NhbGUsIDApO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZXMgYSBnaXZlbiB2ZWN0b3IgdG8gdGhlIGdpdmVuIGxlbmd0aCB3aXRob3V0IGVkaXRpbmcgdGhlIG9yaWdpbmFsIHZlY3Rvci5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIHRoZSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcbiAgICAgKiBAcGFyYW0gX2xlbmd0aCB0aGUgbGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBkZWZhdWx0cyB0byAxXHJcbiAgICAgKiBAcmV0dXJucyBhIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBub3JtYWxpc2VkIHZlY3RvciBzY2FsZWQgYnkgdGhlIGdpdmVuIGxlbmd0aFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIE5PUk1BTElaQVRJT04oX3ZlY3RvcjogVmVjdG9yMiwgX2xlbmd0aDogbnVtYmVyID0gMSk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gVmVjdG9yMi5aRVJPKCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IF92ZWN0b3IuZGF0YTtcclxuICAgICAgICBsZXQgZmFjdG9yOiBudW1iZXIgPSBfbGVuZ3RoIC8gTWF0aC5oeXBvdCh4LCB5KTtcclxuICAgICAgICB2ZWN0b3IuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW192ZWN0b3IueCAqIGZhY3RvciwgX3ZlY3Rvci55ICogZmFjdG9yXSk7XHJcbiAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKF9lKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NhbGVzIGEgZ2l2ZW4gdmVjdG9yIGJ5IGEgZ2l2ZW4gc2NhbGUgd2l0aG91dCBjaGFuZ2luZyB0aGUgb3JpZ2luYWwgdmVjdG9yXHJcbiAgICAgKiBAcGFyYW0gX3ZlY3RvciBUaGUgdmVjdG9yIHRvIHNjYWxlLlxyXG4gICAgICogQHBhcmFtIF9zY2FsZSBUaGUgc2NhbGUgdG8gc2NhbGUgd2l0aC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiB2ZWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBTQ0FMRShfdmVjdG9yOiBWZWN0b3IyLCBfc2NhbGU6IG51bWJlcik6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1bXMgdXAgbXVsdGlwbGUgdmVjdG9ycy5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9ycyBBIHNlcmllcyBvZiB2ZWN0b3JzIHRvIHN1bSB1cFxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgc3VtIG9mIHRoZSBnaXZlbiB2ZWN0b3JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgU1VNKC4uLl92ZWN0b3JzOiBWZWN0b3IyW10pOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICAgIGZvciAobGV0IHZlY3RvciBvZiBfdmVjdG9ycylcclxuICAgICAgICByZXN1bHQuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW3Jlc3VsdC54ICsgdmVjdG9yLngsIHJlc3VsdC55ICsgdmVjdG9yLnldKTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0d28gdmVjdG9ycy5cclxuICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0IGZyb20uXHJcbiAgICAgKiBAcGFyYW0gX2IgVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGRpZmZlcmVuY2Ugb2YgdGhlIGdpdmVuIHZlY3RvcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBESUZGRVJFTkNFKF9hOiBWZWN0b3IyLCBfYjogVmVjdG9yMik6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjI7XHJcbiAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX2EueCAtIF9iLngsIF9hLnkgLSBfYi55XSk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyB0aGUgZG90cHJvZHVjdCBvZiAyIHZlY3RvcnMuXHJcbiAgICAgKiBAcGFyYW0gX2EgVGhlIHZlY3RvciB0byBtdWx0aXBseS5cclxuICAgICAqIEBwYXJhbSBfYiBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZG90cHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIERPVChfYTogVmVjdG9yMiwgX2I6IFZlY3RvcjIpOiBudW1iZXIge1xyXG4gICAgICBsZXQgc2NhbGFyUHJvZHVjdDogbnVtYmVyID0gX2EueCAqIF9iLnggKyBfYS55ICogX2IueTtcclxuICAgICAgcmV0dXJuIHNjYWxhclByb2R1Y3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBtYWduaXR1ZGUgb2YgYSBnaXZlbiB2ZWN0b3IuXHJcbiAgICAgKiBJZiB5b3Ugb25seSBuZWVkIHRvIGNvbXBhcmUgbWFnbml0dWRlcyBvZiBkaWZmZXJlbnQgdmVjdG9ycywgeW91IGNhbiBjb21wYXJlIHNxdWFyZWQgbWFnbml0dWRlcyB1c2luZyBWZWN0b3IyLk1BR05JVFVERVNRUiBpbnN0ZWFkLlxyXG4gICAgICogQHNlZSBWZWN0b3IyLk1BR05JVFVERVNRUlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3IgVGhlIHZlY3RvciB0byBnZXQgdGhlIG1hZ25pdHVkZSBvZi5cclxuICAgICAqIEByZXR1cm5zIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgbWFnbml0dWRlIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTUFHTklUVURFKF92ZWN0b3I6IFZlY3RvcjIpOiBudW1iZXIge1xyXG4gICAgICBsZXQgbWFnbml0dWRlOiBudW1iZXIgPSBNYXRoLnNxcnQoVmVjdG9yMi5NQUdOSVRVREVTUVIoX3ZlY3RvcikpO1xyXG4gICAgICByZXR1cm4gbWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3F1YXJlZCBtYWduaXR1ZGUgb2YgYSBnaXZlbiB2ZWN0b3IuIE11Y2ggbGVzcyBjYWxjdWxhdGlvbiBpbnRlbnNpdmUgdGhhbiBWZWN0b3IyLk1BR05JVFVERSwgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBpZiBwb3NzaWJsZS5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFRoZSB2ZWN0b3IgdG8gZ2V0IHRoZSBzcXVhcmVkIG1hZ25pdHVkZSBvZi5cclxuICAgICAqIEByZXR1cm5zIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgc3F1YXJlZCBtYWduaXR1ZGUgb2YgdGhlIGdpdmVuIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBNQUdOSVRVREVTUVIoX3ZlY3RvcjogVmVjdG9yMik6IG51bWJlciB7XHJcbiAgICAgIGxldCBtYWduaXR1ZGU6IG51bWJlciA9IFZlY3RvcjIuRE9UKF92ZWN0b3IsIF92ZWN0b3IpO1xyXG4gICAgICByZXR1cm4gbWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gVmVjdG9ycy4gRHVlIHRvIHRoZW0gYmVpbmcgb25seSAyIERpbWVuc2lvbmFsLCB0aGUgcmVzdWx0IGlzIGEgc2luZ2xlIG51bWJlcixcclxuICAgICAqIHdoaWNoIGltcGxpY2l0bHkgaXMgb24gdGhlIFogYXhpcy4gSXQgaXMgYWxzbyB0aGUgc2lnbmVkIG1hZ25pdHVkZSBvZiB0aGUgcmVzdWx0LlxyXG4gICAgICogQHBhcmFtIF9hIFZlY3RvciB0byBjb21wdXRlIHRoZSBjcm9zcyBwcm9kdWN0IG9uXHJcbiAgICAgKiBAcGFyYW0gX2IgVmVjdG9yIHRvIGNvbXB1dGUgdGhlIGNyb3NzIHByb2R1Y3Qgd2l0aFxyXG4gICAgICogQHJldHVybnMgQSBudW1iZXIgcmVwcmVzZW50aW5nIHJlc3VsdCBvZiB0aGUgY3Jvc3MgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBDUk9TU1BST0RVQ1QoX2E6IFZlY3RvcjIsIF9iOiBWZWN0b3IyKTogbnVtYmVyIHtcclxuICAgICAgbGV0IGNyb3NzUHJvZHVjdDogbnVtYmVyID0gX2EueCAqIF9iLnkgLSBfYS55ICogX2IueDtcclxuICAgICAgcmV0dXJuIGNyb3NzUHJvZHVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgdGhlIG9ydGhvZ29uYWwgdmVjdG9yIHRvIHRoZSBnaXZlbiB2ZWN0b3IuIFJvdGF0ZXMgY291bnRlcmNsb2Nrd2lzZSBieSBkZWZhdWx0LlxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICBeICAgICAgICAgICAgICAgIHxcclxuICAgICAqICAgIHwgID0+ICA8LS0gID0+ICAgdiAgPT4gIC0tPlxyXG4gICAgICogYGBgXHJcbiAgICAgKiBAcGFyYW0gX3ZlY3RvciBWZWN0b3IgdG8gZ2V0IHRoZSBvcnRob2dvbmFsIGVxdWl2YWxlbnQgb2ZcclxuICAgICAqIEBwYXJhbSBfY2xvY2t3aXNlIFNob3VsZCB0aGUgcm90YXRpb24gYmUgY2xvY2t3aXNlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgY291bnRlcmNsb2Nrd2lzZT8gZGVmYXVsdDogZmFsc2VcclxuICAgICAqIEByZXR1cm5zIEEgVmVjdG9yIHRoYXQgaXMgb3J0aG9nb25hbCB0byBhbmQgaGFzIHRoZSBzYW1lIG1hZ25pdHVkZSBhcyB0aGUgZ2l2ZW4gVmVjdG9yLiAgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgT1JUSE9HT05BTChfdmVjdG9yOiBWZWN0b3IyLCBfY2xvY2t3aXNlOiBib29sZWFuID0gZmFsc2UpOiBWZWN0b3IyIHtcclxuICAgICAgaWYgKF9jbG9ja3dpc2UpIHJldHVybiBuZXcgVmVjdG9yMihfdmVjdG9yLnksIC1fdmVjdG9yLngpO1xyXG4gICAgICBlbHNlIHJldHVybiBuZXcgVmVjdG9yMigtX3ZlY3Rvci55LCBfdmVjdG9yLngpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgZ2l2ZW4gdmVjdG9yIHRvIHRoZSBleGVjdXRpbmcgdmVjdG9yLCBjaGFuZ2luZyB0aGUgZXhlY3V0b3IuXHJcbiAgICAgKiBAcGFyYW0gX2FkZGVuZCBUaGUgdmVjdG9yIHRvIGFkZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZChfYWRkZW5kOiBWZWN0b3IyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IyKF9hZGRlbmQueCArIHRoaXMueCwgX2FkZGVuZC55ICsgdGhpcy55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBnaXZlbiB2ZWN0b3IgZnJvbSB0aGUgZXhlY3V0aW5nIHZlY3RvciwgY2hhbmdpbmcgdGhlIGV4ZWN1dG9yLlxyXG4gICAgICogQHBhcmFtIF9zdWJ0cmFoZW5kIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdWJ0cmFjdChfc3VidHJhaGVuZDogVmVjdG9yMik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGEgPSBuZXcgVmVjdG9yMih0aGlzLnggLSBfc3VidHJhaGVuZC54LCB0aGlzLnkgLSBfc3VidHJhaGVuZC55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NhbGVzIHRoZSBWZWN0b3IgYnkgdGhlIF9zY2FsZS5cclxuICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIHNjYWxlIHRvIG11bHRpcGx5IHRoZSB2ZWN0b3Igd2l0aC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjYWxlKF9zY2FsZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IyKF9zY2FsZSAqIHRoaXMueCwgX3NjYWxlICogdGhpcy55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplcyB0aGUgdmVjdG9yLlxyXG4gICAgICogQHBhcmFtIF9sZW5ndGggQSBtb2RpZmljYXRvciB0byBnZXQgYSBkaWZmZXJlbnQgbGVuZ3RoIG9mIG5vcm1hbGl6ZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbm9ybWFsaXplKF9sZW5ndGg6IG51bWJlciA9IDEpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhID0gVmVjdG9yMi5OT1JNQUxJWkFUSU9OKHRoaXMsIF9sZW5ndGgpLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBWZWN0b3IgdG8gdGhlIGdpdmVuIHBhcmFtZXRlcnMuIE9tbWl0dGVkIHBhcmFtZXRlcnMgZGVmYXVsdCB0byAwLlxyXG4gICAgICogQHBhcmFtIF94IG5ldyB4IHRvIHNldFxyXG4gICAgICogQHBhcmFtIF95IG5ldyB5IHRvIHNldFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0KF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ldKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBWZWN0b3IgaXMgZXF1YWwgdG8gdGhlIGV4ZWN1dGVkIFZlY3Rvci5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFRoZSB2ZWN0b3IgdG8gY29tYXByZSB3aXRoLlxyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdHdvIHZlY3RvcnMgYXJlIGVxdWFsLCBvdGhlcndpc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIGVxdWFscyhfdmVjdG9yOiBWZWN0b3IyKTogYm9vbGVhbiB7XHJcbiAgICAgIGlmICh0aGlzLmRhdGFbMF0gPT0gX3ZlY3Rvci5kYXRhWzBdICYmIHRoaXMuZGF0YVsxXSA9PSBfdmVjdG9yLmRhdGFbMV0pIHJldHVybiB0cnVlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiB0aGUgZGF0YSBvZiB0aGUgdmVjdG9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm5zIEEgZGVlcCBjb3B5IG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgY29weSgpOiBWZWN0b3IyIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSB6LWNvbXBvbmVudCB0byB0aGUgdmVjdG9yIGFuZCByZXR1cm5zIGEgbmV3IFZlY3RvcjNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRvVmVjdG9yMygpOiBWZWN0b3IzIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKHRoaXMueCwgdGhpcy55LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7XHJcbiAgICAgICAgeDogdGhpcy5kYXRhWzBdLCB5OiB0aGlzLmRhdGFbMV1cclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIG11dGF0b3I7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0b3JlcyBhbmQgbWFuaXB1bGF0ZXMgYSB0aHJlZWRpbWVuc2lvbmFsIHZlY3RvciBjb21wcmlzZWQgb2YgdGhlIGNvbXBvbmVudHMgeCwgeSBhbmQgelxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICAgICt5XHJcbiAgICAgKiAgICAgICAgICAgICB8X18gK3hcclxuICAgICAqICAgICAgICAgICAgL1xyXG4gICAgICogICAgICAgICAgK3ogICBcclxuICAgICAqIGBgYFxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVmVjdG9yMyBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHByaXZhdGUgZGF0YTogRmxvYXQzMkFycmF5OyAvLyBUT0RPOiBjaGVjayB3aHkgdGhpcyBzaG91bGRuJ3QgYmUgeCx5LHogYXMgbnVtYmVycy4uLlxyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfejogbnVtYmVyID0gMCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ksIF96XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgZXF1YWxzLWZ1bmN0aW9uc1xyXG4gICAgICAgIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB6KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXQgeChfeDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSA9IF94O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgeShfeTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSA9IF95O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgeihfejogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSA9IF96O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBYKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyhfc2NhbGUsIDAsIDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBZKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCBfc2NhbGUsIDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBaKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAwLCBfc2NhbGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBaRVJPKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgT05FKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyhfc2NhbGUsIF9zY2FsZSwgX3NjYWxlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVFJBTlNGT1JNQVRJT04oX3ZlY3RvcjogVmVjdG9yMywgX21hdHJpeDogTWF0cml4NHg0LCBfaW5jbHVkZVRyYW5zbGF0aW9uOiBib29sZWFuID0gdHJ1ZSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoKTtcclxuICAgICAgICAgICAgbGV0IG06IEZsb2F0MzJBcnJheSA9IF9tYXRyaXguZ2V0KCk7XHJcbiAgICAgICAgICAgIGxldCBbeCwgeSwgel0gPSBfdmVjdG9yLmdldCgpO1xyXG4gICAgICAgICAgICByZXN1bHQueCA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogejtcclxuICAgICAgICAgICAgcmVzdWx0LnkgPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHo7XHJcbiAgICAgICAgICAgIHJlc3VsdC56ID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogejtcclxuXHJcbiAgICAgICAgICAgIGlmIChfaW5jbHVkZVRyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYWRkKF9tYXRyaXgudHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgTk9STUFMSVpBVElPTihfdmVjdG9yOiBWZWN0b3IzLCBfbGVuZ3RoOiBudW1iZXIgPSAxKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjMgPSBWZWN0b3IzLlpFUk8oKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGxldCBbeCwgeSwgel0gPSBfdmVjdG9yLmRhdGE7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmFjdG9yOiBudW1iZXIgPSBfbGVuZ3RoIC8gTWF0aC5oeXBvdCh4LCB5LCB6KTtcclxuICAgICAgICAgICAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX3ZlY3Rvci54ICogZmFjdG9yLCBfdmVjdG9yLnkgKiBmYWN0b3IsIF92ZWN0b3IueiAqIGZhY3Rvcl0pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgRGVidWcud2FybihfZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN1bXMgdXAgbXVsdGlwbGUgdmVjdG9ycy5cclxuICAgICAgICAgKiBAcGFyYW0gX3ZlY3RvcnMgQSBzZXJpZXMgb2YgdmVjdG9ycyB0byBzdW0gdXBcclxuICAgICAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBzdW0gb2YgdGhlIGdpdmVuIHZlY3RvcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFNVTSguLi5fdmVjdG9yczogVmVjdG9yM1tdKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB2ZWN0b3Igb2YgX3ZlY3RvcnMpXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW3Jlc3VsdC54ICsgdmVjdG9yLngsIHJlc3VsdC55ICsgdmVjdG9yLnksIHJlc3VsdC56ICsgdmVjdG9yLnpdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3VidHJhY3RzIHR3byB2ZWN0b3JzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0IGZyb20uXHJcbiAgICAgICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZSBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRElGRkVSRU5DRShfYTogVmVjdG9yMywgX2I6IFZlY3RvcjMpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzO1xyXG4gICAgICAgICAgICB2ZWN0b3IuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW19hLnggLSBfYi54LCBfYS55IC0gX2IueSwgX2EueiAtIF9iLnpdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiB2ZWN0b3Igc2NhbGVkIGJ5IHRoZSBnaXZlbiBzY2FsaW5nIGZhY3RvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgU0NBTEUoX3ZlY3RvcjogVmVjdG9yMywgX3NjYWxpbmc6IG51bWJlcik6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBsZXQgc2NhbGVkOiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoKTtcclxuICAgICAgICAgICAgc2NhbGVkLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfdmVjdG9yLnggKiBfc2NhbGluZywgX3ZlY3Rvci55ICogX3NjYWxpbmcsIF92ZWN0b3IueiAqIF9zY2FsaW5nXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2FsZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbXB1dGVzIHRoZSBjcm9zc3Byb2R1Y3Qgb2YgMiB2ZWN0b3JzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIG11bHRpcGx5LlxyXG4gICAgICAgICAqIEBwYXJhbSBfYiBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGNyb3NzcHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ1JPU1MoX2E6IFZlY3RvcjMsIF9iOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMztcclxuICAgICAgICAgICAgdmVjdG9yLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIF9hLnkgKiBfYi56IC0gX2EueiAqIF9iLnksXHJcbiAgICAgICAgICAgICAgICBfYS56ICogX2IueCAtIF9hLnggKiBfYi56LFxyXG4gICAgICAgICAgICAgICAgX2EueCAqIF9iLnkgLSBfYS55ICogX2IueF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb21wdXRlcyB0aGUgZG90cHJvZHVjdCBvZiAyIHZlY3RvcnMuXHJcbiAgICAgICAgICogQHBhcmFtIF9hIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkuXHJcbiAgICAgICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkgYnkuXHJcbiAgICAgICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZG90cHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRE9UKF9hOiBWZWN0b3IzLCBfYjogVmVjdG9yMyk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGxldCBzY2FsYXJQcm9kdWN0OiBudW1iZXIgPSBfYS54ICogX2IueCArIF9hLnkgKiBfYi55ICsgX2EueiAqIF9iLno7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2FsYXJQcm9kdWN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgcmVmbGVjdGlvbiBvZiB0aGUgaW5jb21pbmcgdmVjdG9yIGF0IHRoZSBnaXZlbiBub3JtYWwgdmVjdG9yLiBUaGUgbGVuZ3RoIG9mIG5vcm1hbCBzaG91bGQgYmUgMS5cclxuICAgICAgICAgKiAgICAgX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICogICAgICAgICAgIC98XFxcclxuICAgICAgICAgKiBpbmNvbWluZyAvIHwgXFwgcmVmbGVjdGlvblxyXG4gICAgICAgICAqICAgICAgICAgLyAgfCAgXFwgICBcclxuICAgICAgICAgKiAgICAgICAgICBub3JtYWxcclxuICAgICAgICAgKiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFJFRkxFQ1RJT04oX2luY29taW5nOiBWZWN0b3IzLCBfbm9ybWFsOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCBkb3Q6IG51bWJlciA9IC1WZWN0b3IzLkRPVChfaW5jb21pbmcsIF9ub3JtYWwpO1xyXG4gICAgICAgICAgICBsZXQgcmVmbGVjdGlvbjogVmVjdG9yMyA9IFZlY3RvcjMuU1VNKF9pbmNvbWluZywgVmVjdG9yMy5TQ0FMRShfbm9ybWFsLCAyICogZG90KSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZWZsZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFkZChfYWRkZW5kOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IzKF9hZGRlbmQueCArIHRoaXMueCwgX2FkZGVuZC55ICsgdGhpcy55LCBfYWRkZW5kLnogKyB0aGlzLnopLmRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdWJ0cmFjdChfc3VidHJhaGVuZDogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVmVjdG9yMyh0aGlzLnggLSBfc3VidHJhaGVuZC54LCB0aGlzLnkgLSBfc3VidHJhaGVuZC55LCB0aGlzLnogLSBfc3VidHJhaGVuZC56KS5kYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc2NhbGUoX3NjYWxlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IFZlY3RvcjMoX3NjYWxlICogdGhpcy54LCBfc2NhbGUgKiB0aGlzLnksIF9zY2FsZSAqIHRoaXMueikuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBub3JtYWxpemUoX2xlbmd0aDogbnVtYmVyID0gMSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBWZWN0b3IzLk5PUk1BTElaQVRJT04odGhpcywgX2xlbmd0aCkuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXQoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfejogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ksIF96XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0KCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHRoaXMuZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0IGNvcHkoKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yMyh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB0cmFuc2Zvcm0oX21hdHJpeDogTWF0cml4NHg0LCBfaW5jbHVkZVRyYW5zbGF0aW9uOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBWZWN0b3IzLlRSQU5TRk9STUFUSU9OKHRoaXMsIF9tYXRyaXgsIF9pbmNsdWRlVHJhbnNsYXRpb24pLmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcm9wcyB0aGUgei1jb21wb25lbnQgYW5kIHJldHVybnMgYSBWZWN0b3IyIGNvbnNpc3Rpbmcgb2YgdGhlIHgtIGFuZCB5LWNvbXBvbmVudHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdG9WZWN0b3IyKCk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJlZmxlY3QoX25vcm1hbDogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zdCByZWZsZWN0ZWQ6IFZlY3RvcjMgPSBWZWN0b3IzLlJFRkxFQ1RJT04odGhpcywgX25vcm1hbCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHJlZmxlY3RlZC54LCByZWZsZWN0ZWQueSwgcmVmbGVjdGVkLnopO1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5zdG9yZShyZWZsZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgICAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy5kYXRhWzBdLCB5OiB0aGlzLmRhdGFbMV0sIHo6IHRoaXMuZGF0YVsyXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gbXV0YXRvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHsvKiogKi8gfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGFsbCBtZXNoZXMuIFxyXG4gICAgICogTWVzaGVzIHByb3ZpZGUgaW5kZXhlZCB2ZXJ0aWNlcywgdGhlIG9yZGVyIG9mIGluZGljZXMgdG8gY3JlYXRlIHRyaWdvbnMgYW5kIG5vcm1hbHMsIGFuZCB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXNoIGltcGxlbWVudHMgU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHRoZXNlIGFycmF5cyBtdXN0IGJlIGNhY2hlZCBsaWtlIHRoaXMgb3IgaWYgY2FsbGluZyB0aGUgbWV0aG9kcyBpcyBiZXR0ZXIuXHJcbiAgICAgICAgcHVibGljIHZlcnRpY2VzOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHVibGljIGluZGljZXM6IFVpbnQxNkFycmF5O1xyXG4gICAgICAgIHB1YmxpYyB0ZXh0dXJlVVZzOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHVibGljIG5vcm1hbHNGYWNlOiBGbG9hdDMyQXJyYXk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpZFJlc291cmNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpOiBCdWZmZXJTcGVjaWZpY2F0aW9uIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgc2l6ZTogMywgZGF0YVR5cGU6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRkxPQVQsIG5vcm1hbGl6ZTogZmFsc2UsIHN0cmlkZTogMCwgb2Zmc2V0OiAwIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBnZXRWZXJ0ZXhDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52ZXJ0aWNlcy5sZW5ndGggLyBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKS5zaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZ2V0SW5kZXhDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRpY2VzLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNlcmlhbGl6ZS9EZXNlcmlhbGl6ZSBmb3IgYWxsIG1lc2hlcyB0aGF0IGNhbGN1bGF0ZSB3aXRob3V0IHBhcmFtZXRlcnNcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGlkUmVzb3VyY2U6IHRoaXMuaWRSZXNvdXJjZVxyXG4gICAgICAgICAgICB9OyAvLyBubyBkYXRhIG5lZWRlZCAuLi5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKCk7IC8vIFRPRE86IG11c3Qgbm90IGJlIGNyZWF0ZWQsIGlmIGFuIGlkZW50aWNhbCBtZXNoIGFscmVhZHkgZXhpc3RzXHJcbiAgICAgICAgICAgIHRoaXMuaWRSZXNvdXJjZSA9IF9zZXJpYWxpemF0aW9uLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGNyZWF0ZSgpOiB2b2lkO1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVWZXJ0aWNlcygpOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5O1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5O1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXk7XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYSBzaW1wbGUgY3ViZSB3aXRoIGVkZ2VzIG9mIGxlbmd0aCAxLCBlYWNoIGZhY2UgY29uc2lzdGluZyBvZiB0d28gdHJpZ29uc1xyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICAgIDRfX19fN1xyXG4gICAgICogICAgICAgICAgIDAvX18zL3xcclxuICAgICAqICAgICAgICAgICAgfHw1X3x8NlxyXG4gICAgICogICAgICAgICAgIDF8L18yfC8gXHJcbiAgICAgKiBgYGBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBNZXNoQ3ViZSBleHRlbmRzIE1lc2gge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBjcmVhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudmVydGljZXMgPSB0aGlzLmNyZWF0ZVZlcnRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kaWNlcyA9IHRoaXMuY3JlYXRlSW5kaWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmVVVnMgPSB0aGlzLmNyZWF0ZVRleHR1cmVVVnMoKTtcclxuICAgICAgICAgICAgdGhpcy5ub3JtYWxzRmFjZSA9IHRoaXMuY3JlYXRlRmFjZU5vcm1hbHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVWZXJ0aWNlcygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgdmVydGljZXM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAxLCAxLCAvKjEqLyAtMSwgLTEsIDEsICAvKjIqLyAxLCAtMSwgMSwgLyozKi8gMSwgMSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIC0xLCAxLCAtMSwgLyogNSovIC0xLCAtMSwgLTEsICAvKiA2Ki8gMSwgLTEsIC0xLCAvKiA3Ki8gMSwgMSwgLTEsXHJcbiAgICAgICAgICAgICAgICAvLyBTZWNvbmQgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAxLCAxLCAvKjEqLyAtMSwgLTEsIDEsICAvKjIqLyAxLCAtMSwgMSwgLyozKi8gMSwgMSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIC0xLCAxLCAtMSwgLyogNSovIC0xLCAtMSwgLTEsICAvKiA2Ki8gMSwgLTEsIC0xLCAvKiA3Ki8gMSwgMSwgLTFcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzY2FsZSBkb3duIHRvIGEgbGVuZ3RoIG9mIDEgZm9yIGFsbCBlZGdlc1xyXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLm1hcChfdmFsdWUgPT4gX3ZhbHVlIC8gMik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSW5kaWNlcygpOiBVaW50MTZBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRpY2VzOiBVaW50MTZBcnJheSA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgMSwgMiwgMCwgMiwgMywgMCwgXHJcbiAgICAgICAgICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgMiwgNiwgMywgNiwgNywgMyxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIDYsIDUsIDcsIDUsIDQsIDcsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2Vjb25kIHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDUgKyA4LCAxICsgOCwgNCArIDgsIDEgKyA4LCAwICsgOCwgNCArIDgsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3BcclxuICAgICAgICAgICAgICAgIDQgKyA4LCAwICsgOCwgMyArIDgsIDcgKyA4LCA0ICsgOCwgMyArIDgsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDUgKyA4LCA2ICsgOCwgMSArIDgsIDYgKyA4LCAyICsgOCwgMSArIDhcclxuXHJcbiAgICAgICAgICAgICAgICAvKixcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDQsIDUsIDEsIDQsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3BcclxuICAgICAgICAgICAgICAgIDQsIDAsIDMsIDQsIDMsIDcsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDEsIDUsIDYsIDEsIDYsIDJcclxuICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5kaWNlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVUZXh0dXJlVVZzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0dXJlVVZzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGZyb250XHJcbiAgICAgICAgICAgICAgICAvKjAqLyAwLCAwLCAvKjEqLyAwLCAxLCAgLyoyKi8gMSwgMSwgLyozKi8gMSwgMCxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIDMsIDAsIC8qNSovIDMsIDEsICAvKjYqLyAyLCAxLCAvKjcqLyAyLCAwLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNlY29uZCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gMSwgMCwgLyoxKi8gMSwgMSwgIC8qMiovIDEsIDIsIC8qMyovIDEsIC0xLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gMCwgMCwgLyo1Ki8gMCwgMSwgIC8qNiovIDAsIDIsIC8qNyovIDAsIC0xXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCB0cmlhbmdsZSwgdGhlIGxhc3QgdmVydGV4IG9mIHRoZSB0aHJlZSBkZWZpbmluZyByZWZlcnMgdG8gdGhlIG5vcm1hbHZlY3RvciB3aGVuIHVzaW5nIGZsYXQgc2hhZGluZ1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIDEsIC8qMSovIDAsIDAsIDAsIC8qMiovIDAsIDAsIDAsIC8qMyovIDEsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyBiYWNrXHJcbiAgICAgICAgICAgICAgICAvKjQqLyAwLCAwLCAwLCAvKjUqLyAwLCAwLCAwLCAvKjYqLyAwLCAwLCAwLCAvKjcqLyAwLCAwLCAtMSxcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZWNvbmQgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIDAsIC8qMSovIDAsIC0xLCAwLCAvKjIqLyAwLCAwLCAwLCAvKjMqLyAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gLTEsIDAsIDAsIC8qNSovIDAsIDAsIDAsIC8qNiovIDAsIDAsIDAsIC8qNyovIDAsIDAsIDBcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvL25vcm1hbHMgPSB0aGlzLmNyZWF0ZVZlcnRpY2VzKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9ybWFscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYSBzaW1wbGUgcHlyYW1pZCB3aXRoIGVkZ2VzIGF0IHRoZSBiYXNlIG9mIGxlbmd0aCAxIGFuZCBhIGhlaWdodCBvZiAxLiBUaGUgc2lkZXMgY29uc2lzdGluZyBvZiBvbmUsIHRoZSBiYXNlIG9mIHR3byB0cmlnb25zXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgICAgICAgNFxyXG4gICAgICogICAgICAgICAgICAgIC9cXGAuXHJcbiAgICAgKiAgICAgICAgICAgIDMvX19cXF9cXCAyXHJcbiAgICAgKiAgICAgICAgICAgMC9fX19fXFwvMVxyXG4gICAgICogYGBgXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTWVzaFB5cmFtaWQgZXh0ZW5kcyBNZXNoIHtcclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY3JlYXRlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnZlcnRpY2VzID0gdGhpcy5jcmVhdGVWZXJ0aWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLmluZGljZXMgPSB0aGlzLmNyZWF0ZUluZGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlVVZzID0gdGhpcy5jcmVhdGVUZXh0dXJlVVZzKCk7XHJcbiAgICAgICAgICAgIHRoaXMubm9ybWFsc0ZhY2UgPSB0aGlzLmNyZWF0ZUZhY2VOb3JtYWxzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlVmVydGljZXMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIGZsb29yXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAtMSwgMCwgMSwgLyoxKi8gMSwgMCwgMSwgIC8qMiovIDEsIDAsIC0xLCAvKjMqLyAtMSwgMCwgLTEsXHJcbiAgICAgICAgICAgICAgICAvLyB0aXBcclxuICAgICAgICAgICAgICAgIC8qNCovIDAsIDIsIDAsICAvLyBkb3VibGUgaGVpZ2h0IHdpbGwgYmUgc2NhbGVkIGRvd25cclxuICAgICAgICAgICAgICAgIC8vIGZsb29yIGFnYWluIGZvciB0ZXh0dXJpbmcgYW5kIG5vcm1hbHNcclxuICAgICAgICAgICAgICAgIC8qNSovIC0xLCAwLCAxLCAvKjYqLyAxLCAwLCAxLCAgLyo3Ki8gMSwgMCwgLTEsIC8qOCovIC0xLCAwLCAtMVxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNjYWxlIGRvd24gdG8gYSBsZW5ndGggb2YgMSBmb3IgYm90dG9tIGVkZ2VzIGFuZCBoZWlnaHRcclxuICAgICAgICAgICAgdmVydGljZXMgPSB2ZXJ0aWNlcy5tYXAoX3ZhbHVlID0+IF92YWx1ZSAvIDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSW5kaWNlcygpOiBVaW50MTZBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRpY2VzOiBVaW50MTZBcnJheSA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgNCwgMCwgMSxcclxuICAgICAgICAgICAgICAgIC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICA0LCAxLCAyLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgNCwgMiwgMyxcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDQsIDMsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDUgKyAwLCA1ICsgMiwgNSArIDEsIDUgKyAwLCA1ICsgMywgNSArIDJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRpY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDEsIC8qMSovIDAuNSwgMSwgIC8qMiovIDEsIDEsIC8qMyovIDAuNSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIDAuNSwgMCxcclxuICAgICAgICAgICAgICAgIC8qNSovIDAsIDAsIC8qNiovIDEsIDAsICAvKjcqLyAxLCAxLCAvKjgqLyAwLCAxXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsczogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBWZWN0b3IzW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHY6IG51bWJlciA9IDA7IHYgPCB0aGlzLnZlcnRpY2VzLmxlbmd0aDsgdiArPSAzKVxyXG4gICAgICAgICAgICAgICAgdmVydGljZXMucHVzaChuZXcgVmVjdG9yMyh0aGlzLnZlcnRpY2VzW3ZdLCB0aGlzLnZlcnRpY2VzW3YgKyAxXSwgdGhpcy52ZXJ0aWNlc1t2ICsgMl0pKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmluZGljZXMubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ZXJ0ZXg6IG51bWJlcltdID0gW3RoaXMuaW5kaWNlc1tpXSwgdGhpcy5pbmRpY2VzW2kgKyAxXSwgdGhpcy5pbmRpY2VzW2kgKyAyXV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdjA6IFZlY3RvcjMgPSBWZWN0b3IzLkRJRkZFUkVOQ0UodmVydGljZXNbdmVydGV4WzBdXSwgdmVydGljZXNbdmVydGV4WzFdXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdjE6IFZlY3RvcjMgPSBWZWN0b3IzLkRJRkZFUkVOQ0UodmVydGljZXNbdmVydGV4WzBdXSwgdmVydGljZXNbdmVydGV4WzJdXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9ybWFsOiBWZWN0b3IzID0gVmVjdG9yMy5OT1JNQUxJWkFUSU9OKFZlY3RvcjMuQ1JPU1ModjAsIHYxKSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlciA9IHZlcnRleFsyXSAqIDM7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW2luZGV4XSA9IG5vcm1hbC54O1xyXG4gICAgICAgICAgICAgICAgbm9ybWFsc1tpbmRleCArIDFdID0gbm9ybWFsLnk7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW2luZGV4ICsgMl0gPSBub3JtYWwuejtcclxuICAgICAgICAgICAgICAgIC8vIG5vcm1hbHMucHVzaChub3JtYWwueCwgbm9ybWFsLnksIG5vcm1hbC56KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub3JtYWxzLnB1c2goMCwgMCwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KG5vcm1hbHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBhIHNpbXBsZSBxdWFkIHdpdGggZWRnZXMgb2YgbGVuZ3RoIDEsIHRoZSBmYWNlIGNvbnNpc3Rpbmcgb2YgdHdvIHRyaWdvbnNcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogICAgICAgIDAgX18gM1xyXG4gICAgICogICAgICAgICB8X198XHJcbiAgICAgKiAgICAgICAgMSAgICAyICAgICAgICAgICAgIFxyXG4gICAgICogYGBgIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE1lc2hRdWFkIGV4dGVuZHMgTWVzaCB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy52ZXJ0aWNlcyA9IHRoaXMuY3JlYXRlVmVydGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5pbmRpY2VzID0gdGhpcy5jcmVhdGVJbmRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZVVWcyA9IHRoaXMuY3JlYXRlVGV4dHVyZVVWcygpO1xyXG4gICAgICAgICAgICB0aGlzLm5vcm1hbHNGYWNlID0gdGhpcy5jcmVhdGVGYWNlTm9ybWFscygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVZlcnRpY2VzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCB2ZXJ0aWNlczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAtMSwgMSwgMCwgLyoxKi8gLTEsIC0xLCAwLCAgLyoyKi8gMSwgLTEsIDAsIC8qMyovIDEsIDEsIDBcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLm1hcChfdmFsdWUgPT4gX3ZhbHVlIC8gMik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IGluZGljZXM6IFVpbnQxNkFycmF5ID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAgICAgICAgICAgICAgIDEsIDIsIDAsIDIsIDMsIDBcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRpY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIC8qMSovIDAsIDEsICAvKjIqLyAxLCAxLCAvKjMqLyAxLCAwXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAwLCAwLCAxLCAvKjEqLyAwLCAwLCAwLCAvKjIqLyAwLCAwLCAwLCAvKjMqLyAxLCAwLCAwXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgTWFwQ2xhc3NUb0NvbXBvbmVudHMge1xyXG4gICAgW2NsYXNzTmFtZTogc3RyaW5nXTogQ29tcG9uZW50W107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXByZXNlbnRzIGEgbm9kZSBpbiB0aGUgc2NlbmV0cmVlLlxyXG4gICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgTm9kZSBleHRlbmRzIEV2ZW50VGFyZ2V0IGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7IC8vIFRoZSBuYW1lIHRvIGNhbGwgdGhpcyBub2RlIGJ5LlxyXG4gICAgcHVibGljIG10eFdvcmxkOiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICBwdWJsaWMgdGltZXN0YW1wVXBkYXRlOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHByaXZhdGUgcGFyZW50OiBOb2RlIHwgbnVsbCA9IG51bGw7IC8vIFRoZSBwYXJlbnQgb2YgdGhpcyBub2RlLlxyXG4gICAgcHJpdmF0ZSBjaGlsZHJlbjogTm9kZVtdID0gW107IC8vIGFycmF5IG9mIGNoaWxkIG5vZGVzIGFwcGVuZGVkIHRvIHRoaXMgbm9kZS5cclxuICAgIHByaXZhdGUgY29tcG9uZW50czogTWFwQ2xhc3NUb0NvbXBvbmVudHMgPSB7fTtcclxuICAgIC8vIHByaXZhdGUgdGFnczogc3RyaW5nW10gPSBbXTsgLy8gTmFtZXMgb2YgdGFncyB0aGF0IGFyZSBhdHRhY2hlZCB0byB0aGlzIG5vZGUuIChUT0RPOiBBcyBvZiB5ZXQgbm8gZnVuY3Rpb25hbGl0eSlcclxuICAgIC8vIHByaXZhdGUgbGF5ZXJzOiBzdHJpbmdbXSA9IFtdOyAvLyBOYW1lcyBvZiB0aGUgbGF5ZXJzIHRoaXMgbm9kZSBpcyBvbi4gKFRPRE86IEFzIG9mIHlldCBubyBmdW5jdGlvbmFsaXR5KVxyXG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIgPSB7fTtcclxuICAgIHByaXZhdGUgY2FwdHVyZXM6IE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgbm9kZSB3aXRoIGEgbmFtZSBhbmQgaW5pdGlhbGl6ZXMgYWxsIGF0dHJpYnV0ZXNcclxuICAgICAqIEBwYXJhbSBfbmFtZSBUaGUgbmFtZSBieSB3aGljaCB0aGUgbm9kZSBjYW4gYmUgY2FsbGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZykge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLm5hbWUgPSBfbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhpcyBub2RlcyBwYXJlbnQgbm9kZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UGFyZW50KCk6IE5vZGUgfCBudWxsIHtcclxuICAgICAgcmV0dXJuIHRoaXMucGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhY2VzIGJhY2sgdGhlIGFuY2VzdG9ycyBvZiB0aGlzIG5vZGUgYW5kIHJldHVybnMgdGhlIGZpcnN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRBbmNlc3RvcigpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IHRoaXM7XHJcbiAgICAgIHdoaWxlIChhbmNlc3Rvci5nZXRQYXJlbnQoKSlcclxuICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLmdldFBhcmVudCgpO1xyXG4gICAgICByZXR1cm4gYW5jZXN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG9ydGN1dCB0byByZXRyaWV2ZSB0aGlzIG5vZGVzIFtbQ29tcG9uZW50VHJhbnNmb3JtXV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBjbXBUcmFuc2Zvcm0oKTogQ29tcG9uZW50VHJhbnNmb3JtIHtcclxuICAgICAgcmV0dXJuIDxDb21wb25lbnRUcmFuc2Zvcm0+dGhpcy5nZXRDb21wb25lbnRzKENvbXBvbmVudFRyYW5zZm9ybSlbMF07XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNob3J0Y3V0IHRvIHJldHJpZXZlIHRoZSBsb2NhbCBbW01hdHJpeDR4NF1dIGF0dGFjaGVkIHRvIHRoaXMgbm9kZXMgW1tDb21wb25lbnRUcmFuc2Zvcm1dXSAgXHJcbiAgICAgKiBSZXR1cm5zIG51bGwgaWYgbm8gW1tDb21wb25lbnRUcmFuc2Zvcm1dXSBpcyBhdHRhY2hlZFxyXG4gICAgICovXHJcbiAgICAvLyBUT0RPOiByZWplY3RlZCBmb3Igbm93LCBzaW5jZSB0aGVyZSBpcyBzb21lIGNvbXB1dGF0aW9uYWwgb3ZlcmhlYWQsIHNvIG5vZGUubXR4TG9jYWwgc2hvdWxkIG5vdCBiZSB1c2VkIGNhcmVsZXNzbHlcclxuICAgIC8vIHB1YmxpYyBnZXQgbXR4TG9jYWwoKTogTWF0cml4NHg0IHtcclxuICAgIC8vICAgICBsZXQgY21wVHJhbnNmb3JtOiBDb21wb25lbnRUcmFuc2Zvcm0gPSB0aGlzLmNtcFRyYW5zZm9ybTtcclxuICAgIC8vICAgICBpZiAoY21wVHJhbnNmb3JtKVxyXG4gICAgLy8gICAgICAgICByZXR1cm4gY21wVHJhbnNmb3JtLmxvY2FsO1xyXG4gICAgLy8gICAgIGVsc2VcclxuICAgIC8vICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gI3JlZ2lvbiBTY2VuZXRyZWVcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGNsb25lIG9mIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDaGlsZHJlbigpOiBOb2RlW10ge1xyXG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5zbGljZSgwKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiByZWZlcmVuY2VzIHRvIGNoaWxkbm9kZXMgd2l0aCB0aGUgc3VwcGxpZWQgbmFtZS4gXHJcbiAgICAgKiBAcGFyYW0gX25hbWUgVGhlIG5hbWUgb2YgdGhlIG5vZGVzIHRvIGJlIGZvdW5kLlxyXG4gICAgICogQHJldHVybiBBbiBhcnJheSB3aXRoIHJlZmVyZW5jZXMgdG8gbm9kZXNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENoaWxkcmVuQnlOYW1lKF9uYW1lOiBzdHJpbmcpOiBOb2RlW10ge1xyXG4gICAgICBsZXQgZm91bmQ6IE5vZGVbXSA9IFtdO1xyXG4gICAgICBmb3VuZCA9IHRoaXMuY2hpbGRyZW4uZmlsdGVyKChfbm9kZTogTm9kZSkgPT4gX25vZGUubmFtZSA9PSBfbmFtZSk7XHJcbiAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIGdpdmVuIHJlZmVyZW5jZSB0byBhIG5vZGUgdG8gdGhlIGxpc3Qgb2YgY2hpbGRyZW4sIGlmIG5vdCBhbHJlYWR5IGluXHJcbiAgICAgKiBAcGFyYW0gX25vZGUgVGhlIG5vZGUgdG8gYmUgYWRkZWQgYXMgYSBjaGlsZFxyXG4gICAgICogQHRocm93cyBFcnJvciB3aGVuIHRyeWluZyB0byBhZGQgYW4gYW5jZXN0b3Igb2YgdGhpcyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwcGVuZENoaWxkKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmluY2x1ZGVzKF9ub2RlKSlcclxuICAgICAgICAvLyBfbm9kZSBpcyBhbHJlYWR5IGEgY2hpbGQgb2YgdGhpc1xyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IHRoaXM7XHJcbiAgICAgIHdoaWxlIChhbmNlc3Rvcikge1xyXG4gICAgICAgIGlmIChhbmNlc3RvciA9PSBfbm9kZSlcclxuICAgICAgICAgIHRocm93IChuZXcgRXJyb3IoXCJDeWNsaWMgcmVmZXJlbmNlIHByb2hpYml0ZWQgaW4gbm9kZSBoaWVyYXJjaHksIGFuY2VzdG9ycyBtdXN0IG5vdCBiZSBhZGRlZCBhcyBjaGlsZHJlblwiKSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgYW5jZXN0b3IgPSBhbmNlc3Rvci5wYXJlbnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChfbm9kZSk7XHJcbiAgICAgIF9ub2RlLnNldFBhcmVudCh0aGlzKTtcclxuICAgICAgX25vZGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuQ0hJTERfQVBQRU5ELCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBnaXZlIG5vZGUgZnJvbSB0aGUgbGlzdCBvZiBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIF9ub2RlIFRoZSBub2RlIHRvIGJlIHJlbW92ZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVDaGlsZChfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICBsZXQgZm91bmQ6IG51bWJlciA9IHRoaXMuZmluZENoaWxkKF9ub2RlKTtcclxuICAgICAgaWYgKGZvdW5kIDwgMClcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBfbm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5DSElMRF9SRU1PVkUsIHsgYnViYmxlczogdHJ1ZSB9KSk7XHJcbiAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGZvdW5kLCAxKTtcclxuICAgICAgX25vZGUuc2V0UGFyZW50KG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIG5vZGUgaW4gdGhlIGxpc3Qgb2YgY2hpbGRyZW4gb3IgLTEgaWYgbm90IGZvdW5kXHJcbiAgICAgKiBAcGFyYW0gX25vZGUgVGhlIG5vZGUgdG8gYmUgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmaW5kQ2hpbGQoX25vZGU6IE5vZGUpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5pbmRleE9mKF9ub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlcGxhY2VzIGEgY2hpbGQgbm9kZSB3aXRoIGFub3RoZXIsIHByZXNlcnZpbmcgdGhlIHBvc2l0aW9uIGluIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0gX3JlcGxhY2UgVGhlIG5vZGUgdG8gYmUgcmVwbGFjZWRcclxuICAgICAqIEBwYXJhbSBfd2l0aCBUaGUgbm9kZSB0byByZXBsYWNlIHdpdGhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlcGxhY2VDaGlsZChfcmVwbGFjZTogTm9kZSwgX3dpdGg6IE5vZGUpOiBib29sZWFuIHtcclxuICAgICAgbGV0IGZvdW5kOiBudW1iZXIgPSB0aGlzLmZpbmRDaGlsZChfcmVwbGFjZSk7XHJcbiAgICAgIGlmIChmb3VuZCA8IDApXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBsZXQgcHJldmlvdXNQYXJlbnQ6IE5vZGUgPSBfd2l0aC5nZXRQYXJlbnQoKTtcclxuICAgICAgaWYgKHByZXZpb3VzUGFyZW50KVxyXG4gICAgICAgIHByZXZpb3VzUGFyZW50LnJlbW92ZUNoaWxkKF93aXRoKTtcclxuICAgICAgX3JlcGxhY2Uuc2V0UGFyZW50KG51bGwpO1xyXG4gICAgICB0aGlzLmNoaWxkcmVuW2ZvdW5kXSA9IF93aXRoO1xyXG4gICAgICBfd2l0aC5zZXRQYXJlbnQodGhpcyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdG9yIHlpZWxkaW5nIHRoZSBub2RlIGFuZCBhbGwgc3VjY2Vzc29ycyBpbiB0aGUgYnJhbmNoIGJlbG93IGZvciBpdGVyYXRpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBicmFuY2goKTogSXRlcmFibGVJdGVyYXRvcjxOb2RlPiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEJyYW5jaEdlbmVyYXRvcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc1VwZGF0ZWQoX3RpbWVzdGFtcFVwZGF0ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiAodGhpcy50aW1lc3RhbXBVcGRhdGUgPT0gX3RpbWVzdGFtcFVwZGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBsaWVzIGEgTXV0YXRvciBmcm9tIFtbQW5pbWF0aW9uXV0gdG8gYWxsIGl0cyBjb21wb25lbnRzIGFuZCB0cmFuc2ZlcnMgaXQgdG8gaXRzIGNoaWxkcmVuLlxyXG4gICAgICogQHBhcmFtIF9tdXRhdG9yIFRoZSBtdXRhdG9yIGdlbmVyYXRlZCBmcm9tIGFuIFtbQW5pbWF0aW9uXV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwcGx5QW5pbWF0aW9uKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIGlmIChfbXV0YXRvci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY29tcG9uZW50TmFtZSBpbiBfbXV0YXRvci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdKSB7XHJcbiAgICAgICAgICAgIGxldCBtdXRhdG9yT2ZDb21wb25lbnQ6IE11dGF0b3IgPSA8TXV0YXRvcj5fbXV0YXRvci5jb21wb25lbnRzO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIG11dGF0b3JPZkNvbXBvbmVudFtjb21wb25lbnROYW1lXSkge1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV1bK2ldKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29tcG9uZW50VG9NdXRhdGU6IENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1tjb21wb25lbnROYW1lXVsraV07XHJcbiAgICAgICAgICAgICAgICBsZXQgbXV0YXRvckFycmF5OiBNdXRhdG9yW10gPSAoPEFycmF5PE11dGF0b3I+Pm11dGF0b3JPZkNvbXBvbmVudFtjb21wb25lbnROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbXV0YXRvcldpdGhDb21wb25lbnROYW1lOiBNdXRhdG9yID0gPE11dGF0b3I+bXV0YXRvckFycmF5WytpXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNuYW1lIGluIG11dGF0b3JXaXRoQ29tcG9uZW50TmFtZSkgeyAgIC8vIHRyaWNrIHVzZWQgdG8gZ2V0IHRoZSBvbmx5IGVudHJ5IGluIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgIGxldCBtdXRhdG9yVG9HaXZlOiBNdXRhdG9yID0gPE11dGF0b3I+bXV0YXRvcldpdGhDb21wb25lbnROYW1lW2NuYW1lXTtcclxuICAgICAgICAgICAgICAgICAgY29tcG9uZW50VG9NdXRhdGUubXV0YXRlKG11dGF0b3JUb0dpdmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoX211dGF0b3IuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgKDxBcnJheTxPYmplY3Q+Pl9tdXRhdG9yLmNoaWxkcmVuKS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9ICg8Tm9kZT4oPEFycmF5PE11dGF0b3I+Pl9tdXRhdG9yLmNoaWxkcmVuKVtpXVtcIsaSLk5vZGVcIl0pLm5hbWU7XHJcbiAgICAgICAgICBsZXQgY2hpbGROb2RlczogTm9kZVtdID0gdGhpcy5nZXRDaGlsZHJlbkJ5TmFtZShuYW1lKTtcclxuICAgICAgICAgIGZvciAobGV0IGNoaWxkTm9kZSBvZiBjaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICAgIGNoaWxkTm9kZS5hcHBseUFuaW1hdGlvbig8TXV0YXRvcj4oPEFycmF5PE11dGF0b3I+Pl9tdXRhdG9yLmNoaWxkcmVuKVtpXVtcIsaSLk5vZGVcIl0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vICNyZWdpb24gQ29tcG9uZW50c1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgY29tcG9uZW50cyBhdHRhY2hlZCB0byB0aGlzIG5vZGUsIGluZGVwZW5kZW50IG9mIHR5cGUuIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0QWxsQ29tcG9uZW50cygpOiBDb21wb25lbnRbXSB7XHJcbiAgICAgIGxldCBhbGw6IENvbXBvbmVudFtdID0gW107XHJcbiAgICAgIGZvciAobGV0IHR5cGUgaW4gdGhpcy5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgYWxsID0gYWxsLmNvbmNhdCh0aGlzLmNvbXBvbmVudHNbdHlwZV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhbGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIGxpc3Qgb2YgY29tcG9uZW50cyBvZiB0aGUgZ2l2ZW4gY2xhc3MgYXR0YWNoZWQgdG8gdGhpcyBub2RlLiBcclxuICAgICAqIEBwYXJhbSBfY2xhc3MgVGhlIGNsYXNzIG9mIHRoZSBjb21wb25lbnRzIHRvIGJlIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50czxUIGV4dGVuZHMgQ29tcG9uZW50PihfY2xhc3M6IG5ldyAoKSA9PiBUKTogVFtdIHtcclxuICAgICAgcmV0dXJuIDxUW10+KHRoaXMuY29tcG9uZW50c1tfY2xhc3MubmFtZV0gfHwgW10pLnNsaWNlKDApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBjb21wb250ZW50IGZvdW5kIG9mIHRoZSBnaXZlbiBjbGFzcyBhdHRhY2hlZCB0aGlzIG5vZGUgb3IgbnVsbCwgaWYgbGlzdCBpcyBlbXB0eSBvciBkb2Vzbid0IGV4aXN0XHJcbiAgICAgKiBAcGFyYW0gX2NsYXNzIFRoZSBjbGFzcyBvZiB0aGUgY29tcG9uZW50cyB0byBiZSBmb3VuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENvbXBvbmVudDxUIGV4dGVuZHMgQ29tcG9uZW50PihfY2xhc3M6IG5ldyAoKSA9PiBUKTogVCB7XHJcbiAgICAgIGxldCBsaXN0OiBUW10gPSA8VFtdPnRoaXMuY29tcG9uZW50c1tfY2xhc3MubmFtZV07XHJcbiAgICAgIGlmIChsaXN0KVxyXG4gICAgICAgIHJldHVybiBsaXN0WzBdO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHN1cHBsaWVkIGNvbXBvbmVudCBpbnRvIHRoZSBub2RlcyBjb21wb25lbnQgbWFwLlxyXG4gICAgICogQHBhcmFtIF9jb21wb25lbnQgVGhlIGNvbXBvbmVudCB0byBiZSBwdXNoZWQgaW50byB0aGUgYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRDb21wb25lbnQoX2NvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgIGlmIChfY29tcG9uZW50LmdldENvbnRhaW5lcigpID09IHRoaXMpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBpZiAodGhpcy5jb21wb25lbnRzW19jb21wb25lbnQudHlwZV0gPT09IHVuZGVmaW5lZClcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHNbX2NvbXBvbmVudC50eXBlXSA9IFtfY29tcG9uZW50XTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGlmIChfY29tcG9uZW50LmlzU2luZ2xldG9uKVxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50IGlzIG1hcmtlZCBzaW5nbGV0b24gYW5kIGNhbid0IGJlIGF0dGFjaGVkLCBubyBtb3JlIHRoYW4gb25lIGFsbG93ZWRcIik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgdGhpcy5jb21wb25lbnRzW19jb21wb25lbnQudHlwZV0ucHVzaChfY29tcG9uZW50KTtcclxuXHJcbiAgICAgIF9jb21wb25lbnQuc2V0Q29udGFpbmVyKHRoaXMpO1xyXG4gICAgICBfY29tcG9uZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkNPTVBPTkVOVF9BREQpKTtcclxuICAgIH1cclxuICAgIC8qKiBcclxuICAgICAqIFJlbW92ZXMgdGhlIGdpdmVuIGNvbXBvbmVudCBmcm9tIHRoZSBub2RlLCBpZiBpdCB3YXMgYXR0YWNoZWQsIGFuZCBzZXRzIGl0cyBwYXJlbnQgdG8gbnVsbC4gXHJcbiAgICAgKiBAcGFyYW0gX2NvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWRcclxuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uIHdoZW4gY29tcG9uZW50IGlzIG5vdCBmb3VuZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVtb3ZlQ29tcG9uZW50KF9jb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGxldCBjb21wb25lbnRzT2ZUeXBlOiBDb21wb25lbnRbXSA9IHRoaXMuY29tcG9uZW50c1tfY29tcG9uZW50LnR5cGVdO1xyXG4gICAgICAgIGxldCBmb3VuZEF0OiBudW1iZXIgPSBjb21wb25lbnRzT2ZUeXBlLmluZGV4T2YoX2NvbXBvbmVudCk7XHJcbiAgICAgICAgaWYgKGZvdW5kQXQgPCAwKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbXBvbmVudHNPZlR5cGUuc3BsaWNlKGZvdW5kQXQsIDEpO1xyXG4gICAgICAgIF9jb21wb25lbnQuc2V0Q29udGFpbmVyKG51bGwpO1xyXG4gICAgICAgIF9jb21wb25lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuQ09NUE9ORU5UX1JFTU9WRSkpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZW1vdmUgY29tcG9uZW50ICcke19jb21wb25lbnR9J2luIG5vZGUgbmFtZWQgJyR7dGhpcy5uYW1lfSdgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vICNyZWdpb24gU2VyaWFsaXphdGlvblxyXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBsZXQgY29tcG9uZW50czogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICBmb3IgKGxldCB0eXBlIGluIHRoaXMuY29tcG9uZW50cykge1xyXG4gICAgICAgIGNvbXBvbmVudHNbdHlwZV0gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5jb21wb25lbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAvLyBjb21wb25lbnRzW3R5cGVdLnB1c2goY29tcG9uZW50LnNlcmlhbGl6ZSgpKTtcclxuICAgICAgICAgIGNvbXBvbmVudHNbdHlwZV0ucHVzaChTZXJpYWxpemVyLnNlcmlhbGl6ZShjb21wb25lbnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2VyaWFsaXphdGlvbltcImNvbXBvbmVudHNcIl0gPSBjb21wb25lbnRzO1xyXG5cclxuICAgICAgbGV0IGNoaWxkcmVuOiBTZXJpYWxpemF0aW9uW10gPSBbXTtcclxuICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgIGNoaWxkcmVuLnB1c2goU2VyaWFsaXplci5zZXJpYWxpemUoY2hpbGQpKTtcclxuICAgICAgfVxyXG4gICAgICBzZXJpYWxpemF0aW9uW1wiY2hpbGRyZW5cIl0gPSBjaGlsZHJlbjtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERV9TRVJJQUxJWkVEKSk7XHJcbiAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9zZXJpYWxpemF0aW9uLm5hbWU7XHJcbiAgICAgIC8vIHRoaXMucGFyZW50ID0gaXMgc2V0IHdoZW4gdGhlIG5vZGVzIGFyZSBhZGRlZFxyXG5cclxuICAgICAgLy8gZGVzZXJpYWxpemUgY29tcG9uZW50cyBmaXJzdCBzbyBzY3JpcHRzIGNhbiByZWFjdCB0byBjaGlsZHJlbiBiZWluZyBhcHBlbmRlZFxyXG4gICAgICBmb3IgKGxldCB0eXBlIGluIF9zZXJpYWxpemF0aW9uLmNvbXBvbmVudHMpIHtcclxuICAgICAgICBmb3IgKGxldCBzZXJpYWxpemVkQ29tcG9uZW50IG9mIF9zZXJpYWxpemF0aW9uLmNvbXBvbmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgIGxldCBkZXNlcmlhbGl6ZWRDb21wb25lbnQ6IENvbXBvbmVudCA9IDxDb21wb25lbnQ+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShzZXJpYWxpemVkQ29tcG9uZW50KTtcclxuICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KGRlc2VyaWFsaXplZENvbXBvbmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGxldCBzZXJpYWxpemVkQ2hpbGQgb2YgX3NlcmlhbGl6YXRpb24uY2hpbGRyZW4pIHtcclxuICAgICAgICBsZXQgZGVzZXJpYWxpemVkQ2hpbGQ6IE5vZGUgPSA8Tm9kZT5TZXJpYWxpemVyLmRlc2VyaWFsaXplKHNlcmlhbGl6ZWRDaGlsZCk7XHJcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChkZXNlcmlhbGl6ZWRDaGlsZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERV9ERVNFUklBTElaRUQpKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLy8gI3JlZ2lvbiBFdmVudHNcclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgbm9kZS4gVGhlIGdpdmVuIGhhbmRsZXIgd2lsbCBiZSBjYWxsZWQgd2hlbiBhIG1hdGNoaW5nIGV2ZW50IGlzIHBhc3NlZCB0byB0aGUgbm9kZS5cclxuICAgICAqIERldmlhdGluZyBmcm9tIHRoZSBzdGFuZGFyZCBFdmVudFRhcmdldCwgaGVyZSB0aGUgX2hhbmRsZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIGFuZCBfY2FwdHVyZSBpcyB0aGUgb25seSBvcHRpb24uXHJcbiAgICAgKiBAcGFyYW0gX3R5cGUgVGhlIHR5cGUgb2YgdGhlIGV2ZW50LCBzaG91bGQgYmUgYW4gZW51bWVyYXRlZCB2YWx1ZSBvZiBOT0RFX0VWRU5ULCBjYW4gYmUgYW55IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIF9oYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIGV2ZW50IHJlYWNoZXMgdGhpcyBub2RlXHJcbiAgICAgKiBAcGFyYW0gX2NhcHR1cmUgV2hlbiB0cnVlLCB0aGUgbGlzdGVuZXIgbGlzdGVucyBpbiB0aGUgY2FwdHVyZSBwaGFzZSwgd2hlbiB0aGUgZXZlbnQgdHJhdmVscyBkZWVwZXIgaW50byB0aGUgaGllcmFyY2h5IG9mIG5vZGVzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcihfdHlwZTogRVZFTlQgfCBzdHJpbmcsIF9oYW5kbGVyOiBFdmVudExpc3RlbmVyLCBfY2FwdHVyZTogYm9vbGVhbiAvKnwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMqLyA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgIGlmIChfY2FwdHVyZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5jYXB0dXJlc1tfdHlwZV0pXHJcbiAgICAgICAgICB0aGlzLmNhcHR1cmVzW190eXBlXSA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2FwdHVyZXNbX3R5cGVdLnB1c2goX2hhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbX3R5cGVdKVxyXG4gICAgICAgICAgdGhpcy5saXN0ZW5lcnNbX3R5cGVdID0gW107XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbX3R5cGVdLnB1c2goX2hhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERpc3BhdGNoZXMgYSBzeW50aGV0aWMgZXZlbnQgZXZlbnQgdG8gdGFyZ2V0LiBUaGlzIGltcGxlbWVudGF0aW9uIGFsd2F5cyByZXR1cm5zIHRydWUgKHN0YW5kYXJkOiByZXR1cm4gdHJ1ZSBvbmx5IGlmIGVpdGhlciBldmVudCdzIGNhbmNlbGFibGUgYXR0cmlidXRlIHZhbHVlIGlzIGZhbHNlIG9yIGl0cyBwcmV2ZW50RGVmYXVsdCgpIG1ldGhvZCB3YXMgbm90IGludm9rZWQpXHJcbiAgICAgKiBUaGUgZXZlbnQgdHJhdmVscyBpbnRvIHRoZSBoaWVyYXJjaHkgdG8gdGhpcyBub2RlIGRpc3BhdGNoaW5nIHRoZSBldmVudCwgaW52b2tpbmcgbWF0Y2hpbmcgaGFuZGxlcnMgb2YgdGhlIG5vZGVzIGFuY2VzdG9ycyBsaXN0ZW5pbmcgdG8gdGhlIGNhcHR1cmUgcGhhc2UsIFxyXG4gICAgICogdGhhbiB0aGUgbWF0Y2hpbmcgaGFuZGxlciBvZiB0aGUgdGFyZ2V0IG5vZGUgaW4gdGhlIHRhcmdldCBwaGFzZSwgYW5kIGJhY2sgb3V0IG9mIHRoZSBoaWVyYXJjaHkgaW4gdGhlIGJ1YmJsaW5nIHBoYXNlLCBpbnZva2luZyBhcHByb3ByaWF0ZSBoYW5kbGVycyBvZiB0aGUgYW52ZXN0b3JzXHJcbiAgICAgKiBAcGFyYW0gX2V2ZW50IFRoZSBldmVudCB0byBkaXNwYXRjaFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGlzcGF0Y2hFdmVudChfZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XHJcbiAgICAgIGxldCBhbmNlc3RvcnM6IE5vZGVbXSA9IFtdO1xyXG4gICAgICBsZXQgdXBjb21pbmc6IE5vZGUgPSB0aGlzO1xyXG4gICAgICAvLyBvdmVyd3JpdGUgZXZlbnQgdGFyZ2V0XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwidGFyZ2V0XCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiB0aGlzIH0pO1xyXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciB1c2luZyBSZWZsZWN0IGluc3RlYWQgb2YgT2JqZWN0IHRocm91Z2hvdXQuIFNlZSBhbHNvIFJlbmRlciBhbmQgTXV0YWJsZS4uLlxyXG4gICAgICB3aGlsZSAodXBjb21pbmcucGFyZW50KVxyXG4gICAgICAgIGFuY2VzdG9ycy5wdXNoKHVwY29taW5nID0gdXBjb21pbmcucGFyZW50KTtcclxuXHJcbiAgICAgIC8vIGNhcHR1cmUgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5DQVBUVVJJTkdfUEhBU0UgfSk7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IGFuY2VzdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IGFuY2VzdG9yc1tpXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImN1cnJlbnRUYXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IGFuY2VzdG9yIH0pO1xyXG4gICAgICAgIGxldCBjYXB0dXJlczogRXZlbnRMaXN0ZW5lcltdID0gYW5jZXN0b3IuY2FwdHVyZXNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgY2FwdHVyZXMpXHJcbiAgICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghX2V2ZW50LmJ1YmJsZXMpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAvLyB0YXJnZXQgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5BVF9UQVJHRVQgfSk7XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcyB9KTtcclxuICAgICAgbGV0IGxpc3RlbmVyczogRXZlbnRMaXN0ZW5lcltdID0gdGhpcy5saXN0ZW5lcnNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIGxpc3RlbmVycylcclxuICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcblxyXG4gICAgICAvLyBidWJibGUgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5CVUJCTElOR19QSEFTRSB9KTtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFuY2VzdG9ycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IGFuY2VzdG9yc1tpXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImN1cnJlbnRUYXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IGFuY2VzdG9yIH0pO1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBhbmNlc3Rvci5saXN0ZW5lcnNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgbGlzdGVuZXJzKVxyXG4gICAgICAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlOyAvL1RPRE86IHJldHVybiBhIG1lYW5pbmdmdWwgdmFsdWUsIHNlZSBkb2N1bWVudGF0aW9uIG9mIGRpc3BhdGNoIGV2ZW50XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEJyb2FkY2FzdHMgYSBzeW50aGV0aWMgZXZlbnQgZXZlbnQgdG8gdGhpcyBub2RlIGFuZCBmcm9tIHRoZXJlIHRvIGFsbCBub2RlcyBkZWVwZXIgaW4gdGhlIGhpZXJhcmNoeSxcclxuICAgICAqIGludm9raW5nIG1hdGNoaW5nIGhhbmRsZXJzIG9mIHRoZSBub2RlcyBsaXN0ZW5pbmcgdG8gdGhlIGNhcHR1cmUgcGhhc2UuIFdhdGNoIHBlcmZvcm1hbmNlIHdoZW4gdGhlcmUgYXJlIG1hbnkgbm9kZXMgaW52b2x2ZWRcclxuICAgICAqIEBwYXJhbSBfZXZlbnQgVGhlIGV2ZW50IHRvIGJyb2FkY2FzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnJvYWRjYXN0RXZlbnQoX2V2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAvLyBvdmVyd3JpdGUgZXZlbnQgdGFyZ2V0IGFuZCBwaGFzZVxyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImV2ZW50UGhhc2VcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IEV2ZW50LkNBUFRVUklOR19QSEFTRSB9KTtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJ0YXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IHRoaXMgfSk7XHJcbiAgICAgIHRoaXMuYnJvYWRjYXN0RXZlbnRSZWN1cnNpdmUoX2V2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdEV2ZW50UmVjdXJzaXZlKF9ldmVudDogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgLy8gY2FwdHVyZSBwaGFzZSBvbmx5XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcyB9KTtcclxuICAgICAgbGV0IGNhcHR1cmVzOiBGdW5jdGlvbltdID0gdGhpcy5jYXB0dXJlc1tfZXZlbnQudHlwZV0gfHwgW107XHJcbiAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgY2FwdHVyZXMpXHJcbiAgICAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICAvLyBhcHBlYXJzIHRvIGJlIHNsb3dlciwgYXN0b25pc2hpbmdseS4uLlxyXG4gICAgICAvLyBjYXB0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAvLyAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICAvLyB9KTtcclxuXHJcbiAgICAgIC8vIHNhbWUgZm9yIGNoaWxkcmVuXHJcbiAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICBjaGlsZC5icm9hZGNhc3RFdmVudFJlY3Vyc2l2ZShfZXZlbnQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwYXJlbnQgb2YgdGhpcyBub2RlIHRvIGJlIHRoZSBzdXBwbGllZCBub2RlLiBXaWxsIGJlIGNhbGxlZCBvbiB0aGUgY2hpbGQgdGhhdCBpcyBhcHBlbmRlZCB0byB0aGlzIG5vZGUgYnkgYXBwZW5kQ2hpbGQoKS5cclxuICAgICAqIEBwYXJhbSBfcGFyZW50IFRoZSBwYXJlbnQgdG8gYmUgc2V0IGZvciB0aGlzIG5vZGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2V0UGFyZW50KF9wYXJlbnQ6IE5vZGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICAgIHRoaXMucGFyZW50ID0gX3BhcmVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlICpnZXRCcmFuY2hHZW5lcmF0b3IoKTogSXRlcmFibGVJdGVyYXRvcjxOb2RlPiB7XHJcbiAgICAgIHlpZWxkIHRoaXM7XHJcbiAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgeWllbGQqIGNoaWxkLmJyYW5jaDtcclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQSBub2RlIG1hbmFnZWQgYnkgW1tSZXNvdXJjZU1hbmFnZXJdXSB0aGF0IGZ1bmN0aW9ucyBhcyBhIHRlbXBsYXRlIGZvciBbW05vZGVSZXNvdXJjZUluc3RhbmNlXV1zIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTm9kZVJlc291cmNlIGV4dGVuZHMgTm9kZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgICAgICBwdWJsaWMgaWRSZXNvdXJjZTogc3RyaW5nID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFuIGluc3RhbmNlIG9mIGEgW1tOb2RlUmVzb3VyY2VdXS4gIFxyXG4gICAgICogVGhpcyBub2RlIGtlZXBzIGEgcmVmZXJlbmNlIHRvIGl0cyByZXNvdXJjZSBhbiBjYW4gdGh1cyBvcHRpbWl6ZSBzZXJpYWxpemF0aW9uXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBOb2RlUmVzb3VyY2VJbnN0YW5jZSBleHRlbmRzIE5vZGUge1xyXG4gICAgICAgIC8qKiBpZCBvZiB0aGUgcmVzb3VyY2UgdGhhdCBpbnN0YW5jZSB3YXMgY3JlYXRlZCBmcm9tICovXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgdGhpcyBzaG91bGQgYmUgYSBkaXJlY3QgcmVmZXJlbmNlIHRvIHRoZSBOb2RlUmVzb3VyY2UsIGluc3RlYWQgb2YgdGhlIGlkXHJcbiAgICAgICAgcHJpdmF0ZSBpZFNvdXJjZTogc3RyaW5nID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihfbm9kZVJlc291cmNlOiBOb2RlUmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgc3VwZXIoXCJOb2RlUmVzb3VyY2VJbnN0YW5jZVwiKTtcclxuICAgICAgICAgICAgaWYgKF9ub2RlUmVzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldChfbm9kZVJlc291cmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlY3JlYXRlIHRoaXMgbm9kZSBmcm9tIHRoZSBbW05vZGVSZXNvdXJjZV1dIHJlZmVyZW5jZWRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZXNvdXJjZTogTm9kZVJlc291cmNlID0gPE5vZGVSZXNvdXJjZT5SZXNvdXJjZU1hbmFnZXIuZ2V0KHRoaXMuaWRTb3VyY2UpO1xyXG4gICAgICAgICAgICB0aGlzLnNldChyZXNvdXJjZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE86IG9wdGltaXplIHVzaW5nIHRoZSByZWZlcmVuY2VkIE5vZGVSZXNvdXJjZSwgc2VyaWFsaXplL2Rlc2VyaWFsaXplIG9ubHkgdGhlIGRpZmZlcmVuY2VzXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBzdXBlci5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbi5pZFNvdXJjZSA9IHRoaXMuaWRTb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmlkU291cmNlID0gX3NlcmlhbGl6YXRpb24uaWRTb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoaXMgbm9kZSB0byBiZSBhIHJlY3JlYXRpb24gb2YgdGhlIFtbTm9kZVJlc291cmNlXV0gZ2l2ZW5cclxuICAgICAgICAgKiBAcGFyYW0gX25vZGVSZXNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc2V0KF9ub2RlUmVzb3VyY2U6IE5vZGVSZXNvdXJjZSk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBleGFtaW5lLCBpZiB0aGUgc2VyaWFsaXphdGlvbiBzaG91bGQgYmUgc3RvcmVkIGluIHRoZSBOb2RlUmVzb3VyY2UgZm9yIG9wdGltaXphdGlvblxyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6ZXIuc2VyaWFsaXplKF9ub2RlUmVzb3VyY2UpO1xyXG4gICAgICAgICAgICAvL1NlcmlhbGl6ZXIuZGVzZXJpYWxpemUoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhdGggaW4gc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlcmlhbGl6ZShzZXJpYWxpemF0aW9uW3BhdGhdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaWRTb3VyY2UgPSBfbm9kZVJlc291cmNlLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERVJFU09VUkNFX0lOU1RBTlRJQVRFRCkpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgUmF5IHtcclxuICAgICAgICBwdWJsaWMgb3JpZ2luOiBWZWN0b3IzO1xyXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246IFZlY3RvcjM7XHJcbiAgICAgICAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfZGlyZWN0aW9uOiBWZWN0b3IzID0gVmVjdG9yMy5aKC0xKSwgX29yaWdpbjogVmVjdG9yMyA9IFZlY3RvcjMuWkVSTygpLCBfbGVuZ3RoOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luID0gX29yaWdpbjtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IF9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgUmF5SGl0IHtcclxuICAgICAgICBwdWJsaWMgbm9kZTogTm9kZTtcclxuICAgICAgICBwdWJsaWMgZmFjZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyB6QnVmZmVyOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9ub2RlOiBOb2RlID0gbnVsbCwgX2ZhY2U6IG51bWJlciA9IDAsIF96QnVmZmVyOiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZSA9IF9ub2RlO1xyXG4gICAgICAgICAgICB0aGlzLmZhY2UgPSBfZmFjZTtcclxuICAgICAgICAgICAgdGhpcy56QnVmZmVyID0gX3pCdWZmZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlJlbmRlck9wZXJhdG9yLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGludGVyZmFjZSBOb2RlUmVmZXJlbmNlcyB7XHJcbiAgICAgICAgc2hhZGVyOiB0eXBlb2YgU2hhZGVyO1xyXG4gICAgICAgIGNvYXQ6IENvYXQ7XHJcbiAgICAgICAgbWVzaDogTWVzaDtcclxuICAgICAgICAvLyBkb25lVHJhbnNmb3JtVG9Xb3JsZDogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIHR5cGUgTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMgPSBNYXA8Tm9kZSwgTm9kZVJlZmVyZW5jZXM+O1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUGlja0J1ZmZlciB7XHJcbiAgICAgICAgbm9kZTogTm9kZTtcclxuICAgICAgICB0ZXh0dXJlOiBXZWJHTFRleHR1cmU7XHJcbiAgICAgICAgZnJhbWVCdWZmZXI6IFdlYkdMRnJhbWVidWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGNsYXNzIG1hbmFnZXMgdGhlIHJlZmVyZW5jZXMgdG8gcmVuZGVyIGRhdGEgdXNlZCBieSBub2Rlcy5cclxuICAgICAqIE11bHRpcGxlIG5vZGVzIG1heSByZWZlciB0byB0aGUgc2FtZSBkYXRhIHZpYSB0aGVpciByZWZlcmVuY2VzIHRvIHNoYWRlciwgY29hdCBhbmQgbWVzaCBcclxuICAgICAqL1xyXG4gICAgY2xhc3MgUmVmZXJlbmNlPFQ+IHtcclxuICAgICAgICBwcml2YXRlIHJlZmVyZW5jZTogVDtcclxuICAgICAgICBwcml2YXRlIGNvdW50OiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfcmVmZXJlbmNlOiBUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmZXJlbmNlID0gX3JlZmVyZW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWZlcmVuY2UoKTogVCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbmNyZWFzZUNvdW50ZXIoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgdGhpcy5jb3VudCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlY3JlYXNlQ291bnRlcigpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb3VudCA9PSAwKSB0aHJvdyAobmV3IEVycm9yKFwiTmVnYXRpdmUgcmVmZXJlbmNlIGNvdW50ZXJcIikpO1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50LS07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hbmFnZXMgdGhlIGhhbmRsaW5nIG9mIHRoZSByZXNzb3VyY2VzIHRoYXQgYXJlIGdvaW5nIHRvIGJlIHJlbmRlcmVkIGJ5IFtbUmVuZGVyT3BlcmF0b3JdXS5cclxuICAgICAqIFN0b3JlcyB0aGUgcmVmZXJlbmNlcyB0byB0aGUgc2hhZGVyLCB0aGUgY29hdCBhbmQgdGhlIG1lc2ggdXNlZCBmb3IgZWFjaCBub2RlIHJlZ2lzdGVyZWQuIFxyXG4gICAgICogV2l0aCB0aGVzZSByZWZlcmVuY2VzLCB0aGUgYWxyZWFkeSBidWZmZXJlZCBkYXRhIGlzIHJldHJpZXZlZCB3aGVuIHJlbmRlcmluZy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbmRlck1hbmFnZXIgZXh0ZW5kcyBSZW5kZXJPcGVyYXRvciB7XHJcbiAgICAgICAgLyoqIFN0b3JlcyByZWZlcmVuY2VzIHRvIHRoZSBjb21waWxlZCBzaGFkZXIgcHJvZ3JhbXMgYW5kIG1ha2VzIHRoZW0gYXZhaWxhYmxlIHZpYSB0aGUgcmVmZXJlbmNlcyB0byBzaGFkZXJzICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyU2hhZGVyczogTWFwPHR5cGVvZiBTaGFkZXIsIFJlZmVyZW5jZTxSZW5kZXJTaGFkZXI+PiA9IG5ldyBNYXAoKTtcclxuICAgICAgICAvKiogU3RvcmVzIHJlZmVyZW5jZXMgdG8gdGhlIHZlcnRleCBhcnJheSBvYmplY3RzIGFuZCBtYWtlcyB0aGVtIGF2YWlsYWJsZSB2aWEgdGhlIHJlZmVyZW5jZXMgdG8gY29hdHMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW5kZXJDb2F0czogTWFwPENvYXQsIFJlZmVyZW5jZTxSZW5kZXJDb2F0Pj4gPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgLyoqIFN0b3JlcyByZWZlcmVuY2VzIHRvIHRoZSB2ZXJ0ZXggYnVmZmVycyBhbmQgbWFrZXMgdGhlbSBhdmFpbGFibGUgdmlhIHRoZSByZWZlcmVuY2VzIHRvIG1lc2hlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlbmRlckJ1ZmZlcnM6IE1hcDxNZXNoLCBSZWZlcmVuY2U8UmVuZGVyQnVmZmVycz4+ID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIG5vZGVzOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcyA9IG5ldyBNYXAoKTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB0aW1lc3RhbXBVcGRhdGU6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBwaWNrQnVmZmVyczogUGlja0J1ZmZlcltdO1xyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIEFkZGluZ1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVyIHRoZSBub2RlIGZvciByZW5kZXJpbmcuIENyZWF0ZSBhIHJlZmVyZW5jZSBmb3IgaXQgYW5kIGluY3JlYXNlIHRoZSBtYXRjaGluZyByZW5kZXItZGF0YSByZWZlcmVuY2VzIG9yIGNyZWF0ZSB0aGVtIGZpcnN0IGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFkZE5vZGUoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbXBNYXRlcmlhbDogQ29tcG9uZW50TWF0ZXJpYWwgPSBfbm9kZS5nZXRDb21wb25lbnQoQ29tcG9uZW50TWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBpZiAoIWNtcE1hdGVyaWFsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNoYWRlcjogdHlwZW9mIFNoYWRlciA9IGNtcE1hdGVyaWFsLm1hdGVyaWFsLmdldFNoYWRlcigpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgc2hhZGVyLCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVByb2dyYW0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRDb2F0KCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JlYXRlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIGNvYXQsIFJlbmRlck1hbmFnZXIuY3JlYXRlUGFyYW1ldGVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBtZXNoOiBNZXNoID0gKDxDb21wb25lbnRNZXNoPl9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKSkubWVzaDtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8TWVzaCwgUmVuZGVyQnVmZmVycz4oUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLCBtZXNoLCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZUJ1ZmZlcnMpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5vZGVSZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IHsgc2hhZGVyOiBzaGFkZXIsIGNvYXQ6IGNvYXQsIG1lc2g6IG1lc2ggfTsgLy8sIGRvbmVUcmFuc2Zvcm1Ub1dvcmxkOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLm5vZGVzLnNldChfbm9kZSwgbm9kZVJlZmVyZW5jZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXIgdGhlIG5vZGUgYW5kIGl0cyB2YWxpZCBzdWNjZXNzb3JzIGluIHRoZSBicmFuY2ggZm9yIHJlbmRlcmluZyB1c2luZyBbW2FkZE5vZGVdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcmV0dXJucyBmYWxzZSwgaWYgdGhlIGdpdmVuIG5vZGUgaGFzIGEgY3VycmVudCB0aW1lc3RhbXAgdGh1cyBoYXZpbmcgYmVpbmcgcHJvY2Vzc2VkIGR1cmluZyBsYXRlc3QgUmVuZGVyTWFuYWdlci51cGRhdGUgYW5kIG5vIGFkZGl0aW9uIGlzIG5lZWRlZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYWRkQnJhbmNoKF9ub2RlOiBOb2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChfbm9kZS5pc1VwZGF0ZWQoUmVuZGVyTWFuYWdlci50aW1lc3RhbXBVcGRhdGUpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIF9ub2RlLmJyYW5jaClcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF5IGZhaWwgd2hlbiBzb21lIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIFRPRE86IGNsZWFudXBcclxuICAgICAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmFkZE5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmxvZyhfZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gUmVtb3ZpbmdcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVbnJlZ2lzdGVyIHRoZSBub2RlIHNvIHRoYXQgaXQgd29uJ3QgYmUgcmVuZGVyZWQgYW55IG1vcmUuIERlY3JlYXNlIHRoZSByZW5kZXItZGF0YSByZWZlcmVuY2VzIGFuZCBkZWxldGUgdGhlIG5vZGUgcmVmZXJlbmNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZU5vZGUoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVSZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKTtcclxuICAgICAgICAgICAgaWYgKCFub2RlUmVmZXJlbmNlcylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPHR5cGVvZiBTaGFkZXIsIFJlbmRlclNoYWRlcj4oUmVuZGVyTWFuYWdlci5yZW5kZXJTaGFkZXJzLCBub2RlUmVmZXJlbmNlcy5zaGFkZXIsIFJlbmRlck1hbmFnZXIuZGVsZXRlUHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIG5vZGVSZWZlcmVuY2VzLmNvYXQsIFJlbmRlck1hbmFnZXIuZGVsZXRlUGFyYW1ldGVyKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZW1vdmVSZWZlcmVuY2U8TWVzaCwgUmVuZGVyQnVmZmVycz4oUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLCBub2RlUmVmZXJlbmNlcy5tZXNoLCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZUJ1ZmZlcnMpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5ub2Rlcy5kZWxldGUoX25vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVW5yZWdpc3RlciB0aGUgbm9kZSBhbmQgaXRzIHZhbGlkIHN1Y2Nlc3NvcnMgaW4gdGhlIGJyYW5jaCB0byBmcmVlIHJlbmRlcmVyIHJlc291cmNlcy4gVXNlcyBbW3JlbW92ZU5vZGVdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUJyYW5jaChfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIF9ub2RlLmJyYW5jaClcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlTm9kZShub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIFVwZGF0aW5nXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVmbGVjdCBjaGFuZ2VzIGluIHRoZSBub2RlIGNvbmNlcm5pbmcgc2hhZGVyLCBjb2F0IGFuZCBtZXNoLCBtYW5hZ2UgdGhlIHJlbmRlci1kYXRhIHJlZmVyZW5jZXMgYWNjb3JkaW5nbHkgYW5kIHVwZGF0ZSB0aGUgbm9kZSByZWZlcmVuY2VzXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB1cGRhdGVOb2RlKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBub2RlUmVmZXJlbmNlczogTm9kZVJlZmVyZW5jZXMgPSBSZW5kZXJNYW5hZ2VyLm5vZGVzLmdldChfbm9kZSk7XHJcbiAgICAgICAgICAgIGlmICghbm9kZVJlZmVyZW5jZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgY21wTWF0ZXJpYWw6IENvbXBvbmVudE1hdGVyaWFsID0gX25vZGUuZ2V0Q29tcG9uZW50KENvbXBvbmVudE1hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaGFkZXI6IHR5cGVvZiBTaGFkZXIgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRTaGFkZXIoKTtcclxuICAgICAgICAgICAgaWYgKHNoYWRlciAhPT0gbm9kZVJlZmVyZW5jZXMuc2hhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgbm9kZVJlZmVyZW5jZXMuc2hhZGVyLCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZVByb2dyYW0pO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8dHlwZW9mIFNoYWRlciwgUmVuZGVyU2hhZGVyPihSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMsIHNoYWRlciwgUmVuZGVyTWFuYWdlci5jcmVhdGVQcm9ncmFtKTtcclxuICAgICAgICAgICAgICAgIG5vZGVSZWZlcmVuY2VzLnNoYWRlciA9IHNoYWRlcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRDb2F0KCk7XHJcbiAgICAgICAgICAgIGlmIChjb2F0ICE9PSBub2RlUmVmZXJlbmNlcy5jb2F0KSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTxDb2F0LCBSZW5kZXJDb2F0PihSZW5kZXJNYW5hZ2VyLnJlbmRlckNvYXRzLCBub2RlUmVmZXJlbmNlcy5jb2F0LCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZVBhcmFtZXRlcik7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTxDb2F0LCBSZW5kZXJDb2F0PihSZW5kZXJNYW5hZ2VyLnJlbmRlckNvYXRzLCBjb2F0LCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVBhcmFtZXRlcik7XHJcbiAgICAgICAgICAgICAgICBub2RlUmVmZXJlbmNlcy5jb2F0ID0gY29hdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1lc2g6IE1lc2ggPSAoPENvbXBvbmVudE1lc2g+KF9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKSkpLm1lc2g7XHJcbiAgICAgICAgICAgIGlmIChtZXNoICE9PSBub2RlUmVmZXJlbmNlcy5tZXNoKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG5vZGVSZWZlcmVuY2VzLm1lc2gsIFJlbmRlck1hbmFnZXIuZGVsZXRlQnVmZmVycyk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG1lc2gsIFJlbmRlck1hbmFnZXIuY3JlYXRlQnVmZmVycyk7XHJcbiAgICAgICAgICAgICAgICBub2RlUmVmZXJlbmNlcy5tZXNoID0gbWVzaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIHRoZSBub2RlIGFuZCBpdHMgdmFsaWQgc3VjY2Vzc29ycyBpbiB0aGUgYnJhbmNoIHVzaW5nIFtbdXBkYXRlTm9kZV1dXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlQnJhbmNoKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgX25vZGUuYnJhbmNoKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci51cGRhdGVOb2RlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gTGlnaHRzXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVmlld3BvcnRzIGNvbGxlY3QgdGhlIGxpZ2h0cyByZWxldmFudCB0byB0aGUgYnJhbmNoIHRvIHJlbmRlciBhbmQgY2FsbHMgc2V0TGlnaHRzIHRvIHBhc3MgdGhlIGNvbGxlY3Rpb24uICBcclxuICAgICAgICAgKiBSZW5kZXJNYW5hZ2VyIHBhc3NlcyBpdCBvbiB0byBhbGwgc2hhZGVycyB1c2VkIHRoYXQgY2FuIHByb2Nlc3MgbGlnaHRcclxuICAgICAgICAgKiBAcGFyYW0gX2xpZ2h0c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2V0TGlnaHRzKF9saWdodHM6IE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIGxldCByZW5kZXJMaWdodHM6IFJlbmRlckxpZ2h0cyA9IFJlbmRlck1hbmFnZXIuY3JlYXRlUmVuZGVyTGlnaHRzKF9saWdodHMpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCByZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciA9IGVudHJ5WzFdLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5zZXRMaWdodHNJblNoYWRlcihyZW5kZXJTaGFkZXIsIF9saWdodHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gUmVuZGVyaW5nXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIGFsbCByZW5kZXIgZGF0YS4gQWZ0ZXIgUmVuZGVyTWFuYWdlciwgbXVsdGlwbGUgdmlld3BvcnRzIGNhbiByZW5kZXIgdGhlaXIgYXNzb2NpYXRlZCBkYXRhIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHNhbWUgZGF0YSBtdWx0aXBsZSB0aW1lc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnRpbWVzdGFtcFVwZGF0ZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlY2FsY3VsYXRlQWxsTm9kZVRyYW5zZm9ybXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENsZWFyIHRoZSBvZmZzY3JlZW4gcmVuZGVyYnVmZmVyIHdpdGggdGhlIGdpdmVuIFtbQ29sb3JdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfY29sb3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjbGVhcihfY29sb3I6IENvbG9yID0gbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuY2xlYXJDb2xvcihfY29sb3IuciwgX2NvbG9yLmcsIF9jb2xvci5iLCBfY29sb3IuYSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5jbGVhcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTE9SX0JVRkZFUl9CSVQgfCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkRFUFRIX0JVRkZFUl9CSVQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVzZXQgdGhlIG9mZnNjcmVlbiBmcmFtZWJ1ZmZlciB0byB0aGUgb3JpZ2luYWwgUmVuZGVyaW5nQ29udGV4dFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVzZXRGcmFtZUJ1ZmZlcihfY29sb3I6IENvbG9yID0gbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuYmluZEZyYW1lYnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRlJBTUVCVUZGRVIsIG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRHJhd3MgdGhlIGJyYW5jaCBzdGFydGluZyB3aXRoIHRoZSBnaXZlbiBbW05vZGVdXSB1c2luZyB0aGUgY2FtZXJhIGdpdmVuIFtbQ29tcG9uZW50Q2FtZXJhXV0uXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY21wQ2FtZXJhIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZHJhd0JyYW5jaChfbm9kZTogTm9kZSwgX2NtcENhbWVyYTogQ29tcG9uZW50Q2FtZXJhLCBfZHJhd05vZGU6IEZ1bmN0aW9uID0gUmVuZGVyTWFuYWdlci5kcmF3Tm9kZSk6IHZvaWQgeyAvLyBUT0RPOiBzZWUgaWYgdGhpcmQgcGFyYW1ldGVyIF93b3JsZD86IE1hdHJpeDR4NCB3b3VsZCBiZSB1c2VmdWxsXHJcbiAgICAgICAgICAgIGlmIChfZHJhd05vZGUgPT0gUmVuZGVyTWFuYWdlci5kcmF3Tm9kZSlcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVzZXRGcmFtZUJ1ZmZlcigpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpbmFsVHJhbnNmb3JtOiBNYXRyaXg0eDQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgY21wTWVzaDogQ29tcG9uZW50TWVzaCA9IF9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKTtcclxuICAgICAgICAgICAgaWYgKGNtcE1lc2gpXHJcbiAgICAgICAgICAgICAgICBmaW5hbFRyYW5zZm9ybSA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTihfbm9kZS5tdHhXb3JsZCwgY21wTWVzaC5waXZvdCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGZpbmFsVHJhbnNmb3JtID0gX25vZGUubXR4V29ybGQ7IC8vIGNhdXRpb24sIFJlbmRlck1hbmFnZXIgaXMgYSByZWZlcmVuY2UuLi5cclxuXHJcbiAgICAgICAgICAgIC8vIG11bHRpcGx5IGNhbWVyYSBtYXRyaXhcclxuICAgICAgICAgICAgbGV0IHByb2plY3Rpb246IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTihfY21wQ2FtZXJhLlZpZXdQcm9qZWN0aW9uTWF0cml4LCBmaW5hbFRyYW5zZm9ybSk7XHJcblxyXG4gICAgICAgICAgICBfZHJhd05vZGUoX25vZGUsIGZpbmFsVHJhbnNmb3JtLCBwcm9qZWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgaW4gX25vZGUuZ2V0Q2hpbGRyZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkTm9kZTogTm9kZSA9IF9ub2RlLmdldENoaWxkcmVuKClbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXdCcmFuY2goY2hpbGROb2RlLCBfY21wQ2FtZXJhLCBfZHJhd05vZGUpOyAvLywgd29ybGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBSZWN5Y2xlci5zdG9yZShwcm9qZWN0aW9uKTtcclxuICAgICAgICAgICAgaWYgKGZpbmFsVHJhbnNmb3JtICE9IF9ub2RlLm10eFdvcmxkKVxyXG4gICAgICAgICAgICAgICAgUmVjeWNsZXIuc3RvcmUoZmluYWxUcmFuc2Zvcm0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFJheUNhc3QgJiBQaWNraW5nXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXdzIHRoZSBicmFuY2ggZm9yIFJheUNhc3Rpbmcgc3RhcnRpbmcgd2l0aCB0aGUgZ2l2ZW4gW1tOb2RlXV0gdXNpbmcgdGhlIGNhbWVyYSBnaXZlbiBbW0NvbXBvbmVudENhbWVyYV1dLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NtcENhbWVyYSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRyYXdCcmFuY2hGb3JSYXlDYXN0KF9ub2RlOiBOb2RlLCBfY21wQ2FtZXJhOiBDb21wb25lbnRDYW1lcmEpOiBQaWNrQnVmZmVyW10geyAvLyBUT0RPOiBzZWUgaWYgdGhpcmQgcGFyYW1ldGVyIF93b3JsZD86IE1hdHJpeDR4NCB3b3VsZCBiZSB1c2VmdWxsXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKCFSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMuZ2V0KFNoYWRlclJheUNhc3QpKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8dHlwZW9mIFNoYWRlciwgUmVuZGVyU2hhZGVyPihSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMsIFNoYWRlclJheUNhc3QsIFJlbmRlck1hbmFnZXIuY3JlYXRlUHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhd0JyYW5jaChfbm9kZSwgX2NtcENhbWVyYSwgUmVuZGVyTWFuYWdlci5kcmF3Tm9kZUZvclJheUNhc3QpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlc2V0RnJhbWVCdWZmZXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHBpY2tOb2RlQXQoX3BvczogVmVjdG9yMiwgX3BpY2tCdWZmZXJzOiBQaWNrQnVmZmVyW10sIF9yZWN0OiBSZWN0YW5nbGUpOiBSYXlIaXRbXSB7XHJcbiAgICAgICAgICAgIGxldCBoaXRzOiBSYXlIaXRbXSA9IFtdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgcGlja0J1ZmZlciBvZiBfcGlja0J1ZmZlcnMpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kRnJhbWVidWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgcGlja0J1ZmZlci5mcmFtZUJ1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBpbnN0ZWFkIG9mIHJlYWRpbmcgYWxsIGRhdGEgYW5kIGFmdGVyd2FyZHMgcGljayB0aGUgcGl4ZWwsIHJlYWQgb25seSB0aGUgcGl4ZWwhXHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KF9yZWN0LndpZHRoICogX3JlY3QuaGVpZ2h0ICogNCk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMucmVhZFBpeGVscygwLCAwLCBfcmVjdC53aWR0aCwgX3JlY3QuaGVpZ2h0LCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfQllURSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGl4ZWw6IG51bWJlciA9IF9wb3MueCArIF9yZWN0LndpZHRoICogX3Bvcy55O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB6QnVmZmVyOiBudW1iZXIgPSBkYXRhWzQgKiBwaXhlbCArIDJdICsgZGF0YVs0ICogcGl4ZWwgKyAzXSAvIDI1NjtcclxuICAgICAgICAgICAgICAgIGxldCBoaXQ6IFJheUhpdCA9IG5ldyBSYXlIaXQocGlja0J1ZmZlci5ub2RlLCAwLCB6QnVmZmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBoaXRzLnB1c2goaGl0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhpdHM7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZHJhd05vZGUoX25vZGU6IE5vZGUsIF9maW5hbFRyYW5zZm9ybTogTWF0cml4NHg0LCBfcHJvamVjdGlvbjogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKTtcclxuICAgICAgICAgICAgaWYgKCFyZWZlcmVuY2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBUT0RPOiBkZWFsIHdpdGggcGFydGlhbCByZWZlcmVuY2VzXHJcblxyXG4gICAgICAgICAgICBsZXQgYnVmZmVySW5mbzogUmVuZGVyQnVmZmVycyA9IFJlbmRlck1hbmFnZXIucmVuZGVyQnVmZmVycy5nZXQocmVmZXJlbmNlcy5tZXNoKS5nZXRSZWZlcmVuY2UoKTtcclxuICAgICAgICAgICAgbGV0IGNvYXRJbmZvOiBSZW5kZXJDb2F0ID0gUmVuZGVyTWFuYWdlci5yZW5kZXJDb2F0cy5nZXQocmVmZXJlbmNlcy5jb2F0KS5nZXRSZWZlcmVuY2UoKTtcclxuICAgICAgICAgICAgbGV0IHNoYWRlckluZm86IFJlbmRlclNoYWRlciA9IFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycy5nZXQocmVmZXJlbmNlcy5zaGFkZXIpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXcoc2hhZGVySW5mbywgYnVmZmVySW5mbywgY29hdEluZm8sIF9maW5hbFRyYW5zZm9ybSwgX3Byb2plY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZHJhd05vZGVGb3JSYXlDYXN0KF9ub2RlOiBOb2RlLCBfZmluYWxUcmFuc2Zvcm06IE1hdHJpeDR4NCwgX3Byb2plY3Rpb246IE1hdHJpeDR4NCk6IHZvaWQgeyAvLyBjcmVhdGUgVGV4dHVyZSB0byByZW5kZXIgdG8sIGludC1yZ2JhXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvb2sgaW50byBTU0JPcyFcclxuICAgICAgICAgICAgbGV0IHRhcmdldDogV2ViR0xUZXh0dXJlID0gUmVuZGVyTWFuYWdlci5nZXRSYXlDYXN0VGV4dHVyZSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZnJhbWVidWZmZXI6IFdlYkdMRnJhbWVidWZmZXIgPSBSZW5kZXJNYW5hZ2VyLmNyYzMuY3JlYXRlRnJhbWVidWZmZXIoKTtcclxuICAgICAgICAgICAgLy8gcmVuZGVyIHRvIG91ciB0YXJnZXRUZXh0dXJlIGJ5IGJpbmRpbmcgdGhlIGZyYW1lYnVmZmVyXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kRnJhbWVidWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXIpO1xyXG4gICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHRleHR1cmUgYXMgdGhlIGZpcnN0IGNvbG9yIGF0dGFjaG1lbnRcclxuICAgICAgICAgICAgY29uc3QgYXR0YWNobWVudFBvaW50OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTE9SX0FUVEFDSE1FTlQwO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuZnJhbWVidWZmZXJUZXh0dXJlMkQoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgYXR0YWNobWVudFBvaW50LCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRhcmdldCwgMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgcmVuZGVyIHRhcmdldFxyXG5cclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzID0gUmVuZGVyTWFuYWdlci5ub2Rlcy5nZXQoX25vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIFRPRE86IGRlYWwgd2l0aCBwYXJ0aWFsIHJlZmVyZW5jZXNcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrQnVmZmVyOiBQaWNrQnVmZmVyID0ge25vZGU6IF9ub2RlLCB0ZXh0dXJlOiB0YXJnZXQsIGZyYW1lQnVmZmVyOiBmcmFtZWJ1ZmZlcn07XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMucHVzaChwaWNrQnVmZmVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBidWZmZXJJbmZvOiBSZW5kZXJCdWZmZXJzID0gUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLmdldChyZWZlcmVuY2VzLm1lc2gpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXdGb3JSYXlDYXN0KFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMubGVuZ3RoLCBidWZmZXJJbmZvLCBfZmluYWxUcmFuc2Zvcm0sIF9wcm9qZWN0aW9uKTtcclxuICAgICAgICAgICAgLy8gbWFrZSB0ZXh0dXJlIGF2YWlsYWJsZSB0byBvbnNjcmVlbi1kaXNwbGF5XHJcbiAgICAgICAgICAgIC8vIElERUE6IEl0ZXJhdGUgb3ZlciB0ZXh0dXJlcywgY29sbGVjdCBkYXRhIGlmIHogaW5kaWNhdGVzIGhpdCwgc29ydCBieSB6XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBnZXRSYXlDYXN0VGV4dHVyZSgpOiBXZWJHTFRleHR1cmUge1xyXG4gICAgICAgICAgICAvLyBjcmVhdGUgdG8gcmVuZGVyIHRvXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFRleHR1cmVXaWR0aDogbnVtYmVyID0gUmVuZGVyTWFuYWdlci5nZXRWaWV3cG9ydFJlY3RhbmdsZSgpLndpZHRoO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUZXh0dXJlSGVpZ2h0OiBudW1iZXIgPSBSZW5kZXJNYW5hZ2VyLmdldFZpZXdwb3J0UmVjdGFuZ2xlKCkuaGVpZ2h0O1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUZXh0dXJlOiBXZWJHTFRleHR1cmUgPSBSZW5kZXJNYW5hZ2VyLmNyYzMuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCB0YXJnZXRUZXh0dXJlKTtcclxuXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGludGVybmFsRm9ybWF0OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkE4O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlOiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX0JZVEU7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMudGV4SW1hZ2UyRChcclxuICAgICAgICAgICAgICAgICAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIDAsIGludGVybmFsRm9ybWF0LCB0YXJnZXRUZXh0dXJlV2lkdGgsIHRhcmdldFRleHR1cmVIZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgbnVsbFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGZpbHRlcmluZyBzbyB3ZSBkb24ndCBuZWVkIG1pcHNcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01JTl9GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTElORUFSKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX1dSQVBfUywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX1dSQVBfVCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFRleHR1cmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmb3JtYXRpb24gb2YgYnJhbmNoXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjYWxjdWxhdGUgdGhlIHdvcmxkIG1hdHJpeCBvZiBhbGwgcmVnaXN0ZXJlZCBub2RlcyByZXNwZWN0aW5nIHRoZWlyIGhpZXJhcmNoaWNhbCByZWxhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWNhbGN1bGF0ZUFsbE5vZGVUcmFuc2Zvcm1zKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBpbm5lciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgaW4gYSBmb3IgZWFjaCBub2RlIGF0IHRoZSBib3R0b20gb2YgUmVuZGVyTWFuYWdlciBmdW5jdGlvblxyXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBtYXJrTm9kZVRvQmVUcmFuc2Zvcm1lZChfbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzLCBfbm9kZTogTm9kZSwgX21hcDogTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gICAgIF9ub2RlUmVmZXJlbmNlcy5kb25lVHJhbnNmb3JtVG9Xb3JsZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICAvLyBpbm5lciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgaW4gYSBmb3IgZWFjaCBub2RlIGF0IHRoZSBib3R0b20gb2YgUmVuZGVyTWFuYWdlciBmdW5jdGlvblxyXG4gICAgICAgICAgICBsZXQgcmVjYWxjdWxhdGVCcmFuY2hDb250YWluaW5nTm9kZTogKF9yOiBOb2RlUmVmZXJlbmNlcywgX246IE5vZGUsIF9tOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcykgPT4gdm9pZCA9IChfbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzLCBfbm9kZTogTm9kZSwgX21hcDogTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbmQgdXBwZXJtb3N0IGFuY2VzdG9yIG5vdCByZWNhbGN1bGF0ZWQgeWV0XHJcbiAgICAgICAgICAgICAgICBsZXQgYW5jZXN0b3I6IE5vZGUgPSBfbm9kZTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJlbnQ6IE5vZGU7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IGFuY2VzdG9yLmdldFBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX25vZGUuaXNVcGRhdGVkKFJlbmRlck1hbmFnZXIudGltZXN0YW1wVXBkYXRlKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5jZXN0b3IgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBub2RlcyB3aXRob3V0IG1lc2hlcyBtdXN0IGJlIHJlZ2lzdGVyZWRcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGFuY2VzdG9ycyBwYXJlbnQgd29ybGQgbWF0cml4IHRvIHN0YXJ0IHdpdGgsIG9yIGlkZW50aXR5IGlmIG5vIHBhcmVudCBleGlzdHMgb3IgaXQncyBtaXNzaW5nIGEgQ29tcG9uZW5UcmFuc2Zvcm1cclxuICAgICAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4ID0gcGFyZW50Lm10eFdvcmxkO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHJlY3Vyc2l2ZSByZWNhbGN1bGF0aW9uIG9mIHRoZSB3aG9sZSBicmFuY2ggc3RhcnRpbmcgZnJvbSB0aGUgYW5jZXN0b3IgZm91bmRcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVjYWxjdWxhdGVUcmFuc2Zvcm1zT2ZOb2RlQW5kQ2hpbGRyZW4oYW5jZXN0b3IsIG1hdHJpeCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBmdW5jdGlvbnMgYWJvdmUgZm9yIGVhY2ggcmVnaXN0ZXJlZCBub2RlXHJcbiAgICAgICAgICAgIC8vIFJlbmRlck1hbmFnZXIubm9kZXMuZm9yRWFjaChtYXJrTm9kZVRvQmVUcmFuc2Zvcm1lZCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIubm9kZXMuZm9yRWFjaChyZWNhbGN1bGF0ZUJyYW5jaENvbnRhaW5pbmdOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlY3Vyc2l2ZSBtZXRob2QgcmVjZWl2aW5nIGEgY2hpbGRub2RlIGFuZCBpdHMgcGFyZW50cyB1cGRhdGVkIHdvcmxkIHRyYW5zZm9ybS4gIFxyXG4gICAgICAgICAqIElmIHRoZSBjaGlsZG5vZGUgb3ducyBhIENvbXBvbmVudFRyYW5zZm9ybSwgaXRzIHdvcmxkbWF0cml4IGlzIHJlY2FsY3VsYXRlZCBhbmQgcGFzc2VkIG9uIHRvIGl0cyBjaGlsZHJlbiwgb3RoZXJ3aXNlIGl0cyBwYXJlbnRzIG1hdHJpeFxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX3dvcmxkIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY2FsY3VsYXRlVHJhbnNmb3Jtc09mTm9kZUFuZENoaWxkcmVuKF9ub2RlOiBOb2RlLCBfd29ybGQ6IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgd29ybGQ6IE1hdHJpeDR4NCA9IF93b3JsZDtcclxuICAgICAgICAgICAgbGV0IGNtcFRyYW5zZm9ybTogQ29tcG9uZW50VHJhbnNmb3JtID0gX25vZGUuY21wVHJhbnNmb3JtO1xyXG4gICAgICAgICAgICBpZiAoY21wVHJhbnNmb3JtKVxyXG4gICAgICAgICAgICAgICAgd29ybGQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04oX3dvcmxkLCBjbXBUcmFuc2Zvcm0ubG9jYWwpO1xyXG5cclxuICAgICAgICAgICAgX25vZGUubXR4V29ybGQgPSB3b3JsZDtcclxuICAgICAgICAgICAgX25vZGUudGltZXN0YW1wVXBkYXRlID0gUmVuZGVyTWFuYWdlci50aW1lc3RhbXBVcGRhdGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBfbm9kZS5nZXRDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlY2FsY3VsYXRlVHJhbnNmb3Jtc09mTm9kZUFuZENoaWxkcmVuKGNoaWxkLCB3b3JsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIE1hbmFnZSByZWZlcmVuY2VzIHRvIHJlbmRlciBkYXRhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhIHJlZmVyZW5jZSB0byBhIHByb2dyYW0sIHBhcmFtZXRlciBvciBidWZmZXIgYnkgZGVjcmVhc2luZyBpdHMgcmVmZXJlbmNlIGNvdW50ZXIgYW5kIGRlbGV0aW5nIGl0LCBpZiB0aGUgY291bnRlciByZWFjaGVzIDBcclxuICAgICAgICAgKiBAcGFyYW0gX2luIFxyXG4gICAgICAgICAqIEBwYXJhbSBfa2V5IFxyXG4gICAgICAgICAqIEBwYXJhbSBfZGVsZXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW1vdmVSZWZlcmVuY2U8S2V5VHlwZSwgUmVmZXJlbmNlVHlwZT4oX2luOiBNYXA8S2V5VHlwZSwgUmVmZXJlbmNlPFJlZmVyZW5jZVR5cGU+PiwgX2tleTogS2V5VHlwZSwgX2RlbGV0b3I6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2U6IFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPjtcclxuICAgICAgICAgICAgcmVmZXJlbmNlID0gX2luLmdldChfa2V5KTtcclxuICAgICAgICAgICAgaWYgKHJlZmVyZW5jZS5kZWNyZWFzZUNvdW50ZXIoKSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRlbGV0aW9ucyBtYXkgYmUgYW4gb3B0aW1pemF0aW9uLCBub3QgbmVjZXNzYXJ5IHRvIHN0YXJ0IHdpdGggYW5kIG1heWJlIGNvdW50ZXJwcm9kdWN0aXZlLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGF0YSBzaG91bGQgYmUgdXNlZCBsYXRlciBhZ2FpbiwgaXQgbXVzdCB0aGVuIGJlIHJlY29uc3RydWN0ZWQuLi5cclxuICAgICAgICAgICAgICAgIF9kZWxldG9yKHJlZmVyZW5jZS5nZXRSZWZlcmVuY2UoKSk7XHJcbiAgICAgICAgICAgICAgICBfaW4uZGVsZXRlKF9rZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbmNyZWFzZXMgdGhlIGNvdW50ZXIgb2YgdGhlIHJlZmVyZW5jZSB0byBhIHByb2dyYW0sIHBhcmFtZXRlciBvciBidWZmZXIuIENyZWF0ZXMgdGhlIHJlZmVyZW5jZSwgaWYgaXQncyBub3QgZXhpc3RlbnQuXHJcbiAgICAgICAgICogQHBhcmFtIF9pbiBcclxuICAgICAgICAgKiBAcGFyYW0gX2tleSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NyZWF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlUmVmZXJlbmNlPEtleVR5cGUsIFJlZmVyZW5jZVR5cGU+KF9pbjogTWFwPEtleVR5cGUsIFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPj4sIF9rZXk6IEtleVR5cGUsIF9jcmVhdG9yOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlOiBSZWZlcmVuY2U8UmVmZXJlbmNlVHlwZT47XHJcbiAgICAgICAgICAgIHJlZmVyZW5jZSA9IF9pbi5nZXQoX2tleSk7XHJcbiAgICAgICAgICAgIGlmIChyZWZlcmVuY2UpXHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UuaW5jcmVhc2VDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IFJlZmVyZW5jZVR5cGUgPSBfY3JlYXRvcihfa2V5KTtcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZSA9IG5ldyBSZWZlcmVuY2U8UmVmZXJlbmNlVHlwZT4oY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UuaW5jcmVhc2VDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICBfaW4uc2V0KF9rZXksIHJlZmVyZW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0NvYXQvQ29hdC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0YXRpYyBzdXBlcmNsYXNzIGZvciB0aGUgcmVwcmVzZW50YXRpb24gb2YgV2ViR2wgc2hhZGVycHJvZ3JhbXMuIFxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcblxyXG4gICAgIC8vIFRPRE86IGRlZmluZSBhdHRyaWJ1dGUvdW5pZm9ybXMgYXMgbGF5b3V0IGFuZCB1c2UgdGhvc2UgY29uc2lzdGVudGx5IGluIHNoYWRlcnNcclxuICAgICBcclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXIge1xyXG4gICAgICAgIC8qKiBUaGUgdHlwZSBvZiBjb2F0IHRoYXQgY2FuIGJlIHVzZWQgd2l0aCB0aGlzIHNoYWRlciB0byBjcmVhdGUgYSBtYXRlcmlhbCAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7IHJldHVybiBudWxsOyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHsgcmV0dXJuIG51bGw7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGNvbG9yIHNoYWRpbmdcclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFNoYWRlckZsYXQgZXh0ZW5kcyBTaGFkZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb2F0Q29sb3JlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmVydGV4U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdCBMaWdodEFtYmllbnQge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0IExpZ2h0RGlyZWN0aW9uYWwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIGRpcmVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1aW50IE1BWF9MSUdIVFNfRElSRUNUSU9OQUwgPSAxMHU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3dvcmxkO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gTGlnaHRBbWJpZW50IHVfYW1iaWVudDtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIHVpbnQgdV9uTGlnaHRzRGlyZWN0aW9uYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBMaWdodERpcmVjdGlvbmFsIHVfZGlyZWN0aW9uYWxbTUFYX0xJR0hUU19ESVJFQ1RJT05BTF07XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBvdXQgdmVjNCB2X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHsgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB1X3Byb2plY3Rpb24gKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzMgbm9ybWFsID0gbWF0Myh1X3dvcmxkKSAqIGFfbm9ybWFsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdl9jb2xvciA9IHZlYzQoMCwwLDAsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodWludCBpID0gMHU7IGkgPCB1X25MaWdodHNEaXJlY3Rpb25hbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbG9hdCBpbGx1bWluYXRpb24gPSAtZG90KG5vcm1hbCwgdV9kaXJlY3Rpb25hbFtpXS5kaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9jb2xvciArPSBpbGx1bWluYXRpb24gKiB1X2RpcmVjdGlvbmFsW2ldLmNvbG9yOyAvLyB2ZWM0KDEsMSwxLDEpOyAvLyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1X2FtYmllbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVfZGlyZWN0aW9uYWxbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBpbiB2ZWM0IHZfY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB2X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogTWF0Y2FwIChNYXRlcmlhbCBDYXB0dXJlKSBzaGFkaW5nLiBUaGUgdGV4dHVyZSBwcm92aWRlZCBieSB0aGUgY29hdCBpcyB1c2VkIGFzIGEgbWF0Y2FwIG1hdGVyaWFsLiBcclxuICAgICAqIEltcGxlbWVudGF0aW9uIGJhc2VkIG9uIGh0dHBzOi8vd3d3LmNsaWNrdG9yZWxlYXNlLmNvbS9ibG9nL2NyZWF0aW5nLXNwaGVyaWNhbC1lbnZpcm9ubWVudC1tYXBwaW5nLXNoYWRlci9cclxuICAgICAqIEBhdXRob3JzIFNpbW9uIFN0b3JsLVNjaHVsa2UsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJNYXRDYXAgZXh0ZW5kcyBTaGFkZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb2F0TWF0Q2FwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfcHJvamVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzIgdGV4X2Nvb3Jkc19zbW9vdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBvdXQgdmVjMiB0ZXhfY29vcmRzX2ZsYXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0NCBub3JtYWxNYXRyaXggPSB0cmFuc3Bvc2UoaW52ZXJzZSh1X3Byb2plY3Rpb24pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVjNCBwID0gdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IG5vcm1hbDQgPSB2ZWM0KGFfbm9ybWFsLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIGUgPSBub3JtYWxpemUoIHZlYzMoIHVfcHJvamVjdGlvbiAqIHAgKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIG4gPSBub3JtYWxpemUoIHZlYzMobm9ybWFsTWF0cml4ICogbm9ybWFsNCkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzMgciA9IHJlZmxlY3QoIGUsIG4gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgbSA9IDIuICogc3FydChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci54LCAyLiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci55LCAyLiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci56ICsgMS4sIDIuIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleF9jb29yZHNfc21vb3RoID0gci54eSAvIG0gKyAuNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4X2Nvb3Jkc19mbGF0ID0gci54eSAvIG0gKyAuNTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdV9wcm9qZWN0aW9uICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IHVfdGludF9jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIGZsb2F0IHVfZmxhdG1peDtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X3RleHR1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMiB0ZXhfY29vcmRzX3Ntb290aDtcclxuICAgICAgICAgICAgICAgICAgICBmbGF0IGluIHZlYzIgdGV4X2Nvb3Jkc19mbGF0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXQgdmVjNCBmcmFnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzIgdGMgPSBtaXgodGV4X2Nvb3Jkc19zbW9vdGgsIHRleF9jb29yZHNfZmxhdCwgdV9mbGF0bWl4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZyA9IHVfdGludF9jb2xvciAqIHRleHR1cmUodV90ZXh0dXJlLCB0YykgKiAyLjA7XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcnMgZm9yIFJheWNhc3RpbmdcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJSYXlDYXN0IGV4dGVuZHMgU2hhZGVyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldFZlcnRleFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfcHJvamVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7ICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdV9wcm9qZWN0aW9uICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIGludCB1X2lkO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dCB2ZWM0IGZyYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IGlkID0gZmxvYXQodV9pZCkvIDI1Ni4wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IHVwcGVyYnl0ZSA9IHRydW5jKGdsX0ZyYWdDb29yZC56ICogMjU2LjApIC8gMjU2LjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgbG93ZXJieXRlID0gZnJhY3QoZ2xfRnJhZ0Nvb3JkLnogKiAyNTYuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZnJhZyA9IHZlYzQoaWQsIGlkLCB1cHBlcmJ5dGUgLCBsb3dlcmJ5dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0dXJlZCBzaGFkaW5nXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJUZXh0dXJlIGV4dGVuZHMgU2hhZGVyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldENvYXQoKTogdHlwZW9mIENvYXQge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29hdFRleHR1cmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBpbiB2ZWMyIGFfdGV4dHVyZVVWcztcclxuICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcbiAgICAgICAgICAgICAgICB1bmlmb3JtIHZlYzQgdV9jb2xvcjtcclxuICAgICAgICAgICAgICAgIG91dCB2ZWMyIHZfdGV4dHVyZVVWcztcclxuXHJcbiAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7ICBcclxuICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB2X3RleHR1cmVVVnMgPSBhX3RleHR1cmVVVnM7XHJcbiAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGluIHZlYzIgdl90ZXh0dXJlVVZzO1xyXG4gICAgICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV90ZXh0dXJlO1xyXG4gICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWcgPSB0ZXh0dXJlKHVfdGV4dHVyZSwgdl90ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFNpbmdsZSBjb2xvciBzaGFkaW5nXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJVbmlDb2xvciBleHRlbmRzIFNoYWRlciB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDb2F0KCk6IHR5cGVvZiBDb2F0IHtcclxuICAgICAgICAgICAgcmV0dXJuIENvYXRDb2xvcmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkgeyAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gdmVjNCB1X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dCB2ZWM0IGZyYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB1X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIGRpZmZlcmVudCBraW5kcyBvZiB0ZXh0dXJlcy4gXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgVGV4dHVyZSBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKCk6IHZvaWQgey8qKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGV4dHVyZSBjcmVhdGVkIGZyb20gYW4gZXhpc3RpbmcgaW1hZ2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRleHR1cmVJbWFnZSBleHRlbmRzIFRleHR1cmUge1xyXG4gICAgICAgIHB1YmxpYyBpbWFnZTogSFRNTEltYWdlRWxlbWVudCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGEgY2FudmFzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0dXJlQ2FudmFzIGV4dGVuZHMgVGV4dHVyZSB7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGEgRlVER0UtU2tldGNoXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0dXJlU2tldGNoIGV4dGVuZHMgVGV4dHVyZUNhbnZhcyB7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGFuIEhUTUwtcGFnZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVGV4dHVyZUhUTUwgZXh0ZW5kcyBUZXh0dXJlQ2FudmFzIHtcclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZW51bSBUSU1FUl9UWVBFIHtcclxuICAgICAgICBJTlRFUlZBTCxcclxuICAgICAgICBUSU1FT1VUXHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIFRpbWVycyB7XHJcbiAgICAgICAgW2lkOiBudW1iZXJdOiBUaW1lcjtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBUaW1lciB7XHJcbiAgICAgICAgYWN0aXZlOiBib29sZWFuO1xyXG4gICAgICAgIHR5cGU6IFRJTUVSX1RZUEU7XHJcbiAgICAgICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xyXG4gICAgICAgIHRpbWVvdXQ6IG51bWJlcjtcclxuICAgICAgICBhcmd1bWVudHM6IE9iamVjdFtdO1xyXG4gICAgICAgIHN0YXJ0VGltZVJlYWw6IG51bWJlcjtcclxuICAgICAgICB0aW1lb3V0UmVhbDogbnVtYmVyO1xyXG4gICAgICAgIGlkOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF90aW1lOiBUaW1lLCBfdHlwZTogVElNRVJfVFlQRSwgX2NhbGxiYWNrOiBGdW5jdGlvbiwgX3RpbWVvdXQ6IG51bWJlciwgX2FyZ3VtZW50czogT2JqZWN0W10pIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gX3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IF90aW1lb3V0O1xyXG4gICAgICAgICAgICB0aGlzLmFyZ3VtZW50cyA9IF9hcmd1bWVudHM7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lUmVhbCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gX2NhbGxiYWNrO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNjYWxlOiBudW1iZXIgPSBNYXRoLmFicyhfdGltZS5nZXRTY2FsZSgpKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2NhbGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRpbWUgaXMgc3RvcHBlZCwgdGltZXIgd29uJ3QgYmUgYWN0aXZlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaWQ6IG51bWJlcjtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0UmVhbCA9IHRoaXMudGltZW91dCAvIHNjYWxlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBUSU1FUl9UWVBFLlRJTUVPVVQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjazogRnVuY3Rpb24gPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RpbWUuZGVsZXRlVGltZXJCeUludGVybmFsSWQodGhpcy5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2NhbGxiYWNrKF9hcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlkID0gd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIHRoaXMudGltZW91dFJlYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGlkID0gd2luZG93LnNldEludGVydmFsKF9jYWxsYmFjaywgdGhpcy50aW1lb3V0UmVhbCwgX2FyZ3VtZW50cyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBUSU1FUl9UWVBFLlRJTUVPVVQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBzYXZlIHJlbWFpbmluZyB0aW1lIHRvIHRpbWVvdXQgYXMgbmV3IHRpbWVvdXQgZm9yIHJlc3RhcnRcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLnRpbWVvdXQgKiAoMSAtIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuc3RhcnRUaW1lUmVhbCkgLyB0aGlzLnRpbWVvdXRSZWFsKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogcmV1c2luZyB0aW1lciBzdGFydHMgaW50ZXJ2YWwgYW5ldy4gU2hvdWxkIGJlIHJlbWFpbmluZyBpbnRlcnZhbCBhcyB0aW1lb3V0LCB0aGVuIHN0YXJ0aW5nIGludGVydmFsIGFuZXcgXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW5jZXMgb2YgdGhpcyBjbGFzcyBnZW5lcmF0ZSBhIHRpbWVzdGFtcCB0aGF0IGNvcnJlbGF0ZXMgd2l0aCB0aGUgdGltZSBlbGFwc2VkIHNpbmNlIHRoZSBzdGFydCBvZiB0aGUgcHJvZ3JhbSBidXQgYWxsb3dzIGZvciByZXNldHRpbmcgYW5kIHNjYWxpbmcuICBcclxuICAgICAqIFN1cHBvcnRzIGludGVydmFsLSBhbmQgdGltZW91dC1jYWxsYmFja3MgaWRlbnRpY2FsIHdpdGggc3RhbmRhcmQgSmF2YXNjcmlwdCBidXQgd2l0aCByZXNwZWN0IHRvIHRoZSBzY2FsZWQgdGltZVxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRpbWUgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2FtZVRpbWU6IFRpbWUgPSBuZXcgVGltZSgpO1xyXG4gICAgICAgIHByaXZhdGUgc3RhcnQ6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIHNjYWxlOiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBvZmZzZXQ6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIGxhc3RDYWxsVG9FbGFwc2VkOiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSB0aW1lcnM6IFRpbWVycyA9IHt9O1xyXG4gICAgICAgIHByaXZhdGUgaWRUaW1lck5leHQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUgPSAxLjA7XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gMC4wO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkID0gMC4wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZ2FtZS10aW1lLW9iamVjdCB3aGljaCBzdGFydHMgYXV0b21hdGljYWxseSBhbmQgc2VydmVzIGFzIGJhc2UgZm9yIHZhcmlvdXMgaW50ZXJuYWwgb3BlcmF0aW9ucy4gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgZ2FtZSgpOiBUaW1lIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRpbWUuZ2FtZVRpbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgc2NhbGVkIHRpbWVzdGFtcCBvZiB0aGlzIGluc3RhbmNlIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0ICsgdGhpcy5zY2FsZSAqIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuc3RhcnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKFJlLSkgU2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoaXMgaW5zdGFuY2VcclxuICAgICAgICAgKiBAcGFyYW0gX3RpbWUgVGhlIHRpbWVzdGFtcCB0byByZXByZXNlbnQgdGhlIGN1cnJlbnQgdGltZSAoZGVmYXVsdCAwLjApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldChfdGltZTogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IF90aW1lO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxhcHNlZFNpbmNlUHJldmlvdXNDYWxsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXRzIHRoZSBzY2FsaW5nIG9mIHRoaXMgdGltZSwgYWxsb3dpbmcgZm9yIHNsb3dtb3Rpb24gKDwxKSBvciBmYXN0Zm9yd2FyZCAoPjEpIFxyXG4gICAgICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIGRlc2lyZWQgc2NhbGluZyAoZGVmYXVsdCAxLjApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldFNjYWxlKF9zY2FsZTogbnVtYmVyID0gMS4wKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHRoaXMuZ2V0KCkpO1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlID0gX3NjYWxlO1xyXG4gICAgICAgICAgICAvL1RPRE86IGNhdGNoIHNjYWxlPTBcclxuICAgICAgICAgICAgdGhpcy5yZXNjYWxlQWxsVGltZXJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxhcHNlZFNpbmNlUHJldmlvdXNDYWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuVElNRV9TQ0FMRUQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY2FsaW5nIG9mIHRoaXMgdGltZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRTY2FsZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRPZmZzZXQoKTogbnVtYmVyIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLm9mZnNldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgc2NhbGVkIHRpbWUgaW4gbWlsbGlzZWNvbmRzIHBhc3NlZCBzaW5jZSB0aGUgbGFzdCBjYWxsIHRvIHRoaXMgbWV0aG9kXHJcbiAgICAgICAgICogQXV0b21hdGljYWxseSByZXNldCBhdCBldmVyeSBjYWxsIHRvIHNldCguLi4pIGFuZCBzZXRTY2FsZSguLi4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEVsYXBzZWRTaW5jZVByZXZpb3VzQ2FsbCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudDogbnVtYmVyID0gdGhpcy5nZXQoKTtcclxuICAgICAgICAgICAgbGV0IGVsYXBzZWQ6IG51bWJlciA9IGN1cnJlbnQgLSB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkID0gY3VycmVudDtcclxuICAgICAgICAgICAgcmV0dXJuIGVsYXBzZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVGltZXJzXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSBpZiB3ZWItd29ya2VycyB3b3VsZCBlbmhhbmNlIHBlcmZvcm1hbmNlIGhlcmUhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIEphdmFzY3JpcHQgZG9jdW1lbnRhdGlvbi4gQ3JlYXRlcyBhbiBpbnRlcm5hbCBbW1RpbWVyXV0gb2JqZWN0XHJcbiAgICAgICAgICogQHBhcmFtIF9jYWxsYmFja1xyXG4gICAgICAgICAqIEBwYXJhbSBfdGltZW91dCBcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3VtZW50cyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0VGltZW91dChfY2FsbGJhY2s6IEZ1bmN0aW9uLCBfdGltZW91dDogbnVtYmVyLCAuLi5fYXJndW1lbnRzOiBPYmplY3RbXSk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFRpbWVyKFRJTUVSX1RZUEUuVElNRU9VVCwgX2NhbGxiYWNrLCBfdGltZW91dCwgX2FyZ3VtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBKYXZhc2NyaXB0IGRvY3VtZW50YXRpb24uIENyZWF0ZXMgYW4gaW50ZXJuYWwgW1tUaW1lcl1dIG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FsbGJhY2sgXHJcbiAgICAgICAgICogQHBhcmFtIF90aW1lb3V0IFxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJndW1lbnRzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRJbnRlcnZhbChfY2FsbGJhY2s6IEZ1bmN0aW9uLCBfdGltZW91dDogbnVtYmVyLCAuLi5fYXJndW1lbnRzOiBPYmplY3RbXSk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFRpbWVyKFRJTUVSX1RZUEUuSU5URVJWQUwsIF9jYWxsYmFjaywgX3RpbWVvdXQsIF9hcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgSmF2YXNjcmlwdCBkb2N1bWVudGF0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIF9pZCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY2xlYXJUaW1lb3V0KF9pZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlVGltZXIoX2lkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIEphdmFzY3JpcHQgZG9jdW1lbnRhdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSBfaWQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNsZWFySW50ZXJ2YWwoX2lkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVUaW1lcihfaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcHMgYW5kIGRlbGV0ZXMgYWxsIFtbVGltZXJdXXMgYXR0YWNoZWQuIFNob3VsZCBiZSBjYWxsZWQgYmVmb3JlIHRoaXMgVGltZS1vYmplY3QgbGVhdmVzIHNjb3BlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNsZWFyQWxsVGltZXJzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLnRpbWVycykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVUaW1lcihOdW1iZXIoaWQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjcmVhdGVzIFtbVGltZXJdXXMgd2hlbiBzY2FsaW5nIGNoYW5nZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcmVzY2FsZUFsbFRpbWVycygpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy50aW1lcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lcjogVGltZXIgPSB0aGlzLnRpbWVyc1tpZF07XHJcbiAgICAgICAgICAgICAgICB0aW1lci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNjYWxlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbWUgaGFzIHN0b3BwZWQsIG5vIG5lZWQgdG8gcmVwbGFjZSBjbGVhcmVkIHRpbWVyc1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aW1lb3V0OiBudW1iZXIgPSB0aW1lci50aW1lb3V0O1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHRpbWVyLnR5cGUgPT0gVElNRVJfVFlQRS5USU1FT1VUICYmIHRpbWVyLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBmb3IgYW4gYWN0aXZlIHRpbWVvdXQtdGltZXIsIGNhbGN1bGF0ZSB0aGUgcmVtYWluaW5nIHRpbWUgdG8gdGltZW91dFxyXG4gICAgICAgICAgICAgICAgLy8gICAgIHRpbWVvdXQgPSAocGVyZm9ybWFuY2Uubm93KCkgLSB0aW1lci5zdGFydFRpbWVSZWFsKSAvIHRpbWVyLnRpbWVvdXRSZWFsO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlcGxhY2U6IFRpbWVyID0gbmV3IFRpbWVyKHRoaXMsIHRpbWVyLnR5cGUsIHRpbWVyLmNhbGxiYWNrLCB0aW1lb3V0LCB0aW1lci5hcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcnNbaWRdID0gcmVwbGFjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlcyBbW1RpbWVyXV0gZm91bmQgdXNpbmcgdGhlIGlkIG9mIHRoZSBjb25uZWN0ZWQgaW50ZXJ2YWwvdGltZW91dC1vYmplY3RcclxuICAgICAgICAgKiBAcGFyYW0gX2lkIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBkZWxldGVUaW1lckJ5SW50ZXJuYWxJZChfaWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLnRpbWVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWVyOiBUaW1lciA9IHRoaXMudGltZXJzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lci5pZCA9PSBfaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVyc1tpZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc2V0VGltZXIoX3R5cGU6IFRJTUVSX1RZUEUsIF9jYWxsYmFjazogRnVuY3Rpb24sIF90aW1lb3V0OiBudW1iZXIsIF9hcmd1bWVudHM6IE9iamVjdFtdKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgbGV0IHRpbWVyOiBUaW1lciA9IG5ldyBUaW1lcih0aGlzLCBfdHlwZSwgX2NhbGxiYWNrLCBfdGltZW91dCwgX2FyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZXJzWysrdGhpcy5pZFRpbWVyTmV4dF0gPSB0aW1lcjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWRUaW1lck5leHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRlbGV0ZVRpbWVyKF9pZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZXJzW19pZF0uY2xlYXIoKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMudGltZXJzW19pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vRXZlbnQvRXZlbnQudHNcIi8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uL1RpbWUvVGltZS50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgZW51bSBMT09QX01PREUge1xyXG4gICAgICAgIC8qKiBMb29wIGN5Y2xlcyBjb250cm9sbGVkIGJ5IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cclxuICAgICAgICBGUkFNRV9SRVFVRVNUID0gXCJmcmFtZVJlcXVlc3RcIixcclxuICAgICAgICAvKiogTG9vcCBjeWNsZXMgd2l0aCB0aGUgZ2l2ZW4gZnJhbWVyYXRlIGluIFtbVGltZV1dLmdhbWUgKi9cclxuICAgICAgICBUSU1FX0dBTUUgPSBcInRpbWVHYW1lXCIsXHJcbiAgICAgICAgLyoqIExvb3AgY3ljbGVzIHdpdGggdGhlIGdpdmVuIGZyYW1lcmF0ZSBpbiByZWFsdGltZSwgaW5kZXBlbmRlbnQgb2YgW1tUaW1lXV0uZ2FtZSAqL1xyXG4gICAgICAgIFRJTUVfUkVBTCA9IFwidGltZVJlYWxcIlxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDb3JlIGxvb3Agb2YgYSBGdWRnZSBhcHBsaWNhdGlvbi4gSW5pdGlhbGl6ZXMgYXV0b21hdGljYWxseSBhbmQgbXVzdCBiZSBzdGFydGVkIGV4cGxpY2l0bHkuXHJcbiAgICAgKiBJdCB0aGVuIGZpcmVzIFtbRVZFTlRdXS5MT09QXFxfRlJBTUUgdG8gYWxsIGFkZGVkIGxpc3RlbmVycyBhdCBlYWNoIGZyYW1lXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBMb29wIGV4dGVuZHMgRXZlbnRUYXJnZXRTdGF0aWMge1xyXG4gICAgICAgIC8qKiBUaGUgZ2FtZXRpbWUgdGhlIGxvb3Agd2FzIHN0YXJ0ZWQsIG92ZXJ3cml0dGVuIGF0IGVhY2ggc3RhcnQgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRpbWVTdGFydEdhbWU6IG51bWJlciA9IDA7XHJcbiAgICAgICAgLyoqIFRoZSByZWFsdGltZSB0aGUgbG9vcCB3YXMgc3RhcnRlZCwgb3ZlcndyaXR0ZW4gYXQgZWFjaCBzdGFydCAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZVN0YXJ0UmVhbDogbnVtYmVyID0gMDtcclxuICAgICAgICAvKiogVGhlIGdhbWV0aW1lIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgbG9vcCBjeWNsZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZUZyYW1lR2FtZTogbnVtYmVyID0gMDtcclxuICAgICAgICAvKiogVGhlIHJlYWx0aW1lIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgbG9vcCBjeWNsZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZUZyYW1lUmVhbDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZUdhbWU6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZVJlYWw6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZUdhbWVBdmc6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZVJlYWxBdmc6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIG1vZGU6IExPT1BfTU9ERSA9IExPT1BfTU9ERS5GUkFNRV9SRVFVRVNUO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGlkSW50ZXJ2YWxsOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGlkUmVxdWVzdDogbnVtYmVyID0gMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmcHNEZXNpcmVkOiBudW1iZXIgPSAzMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmcmFtZXNUb0F2ZXJhZ2U6IG51bWJlciA9IDMwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN5bmNXaXRoQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RhcnRzIHRoZSBsb29wIHdpdGggdGhlIGdpdmVuIG1vZGUgYW5kIGZwc1xyXG4gICAgICAgICAqIEBwYXJhbSBfbW9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2ZwcyBJcyBvbmx5IGFwcGxpY2FibGUgaW4gVElNRS1tb2Rlc1xyXG4gICAgICAgICAqIEBwYXJhbSBfc3luY1dpdGhBbmltYXRpb25GcmFtZSBFeHBlcmltZW50YWwgYW5kIG9ubHkgYXBwbGljYWJsZSBpbiBUSU1FLW1vZGVzLiBTaG91bGQgZGVmZXIgdGhlIGxvb3AtY3ljbGUgdW50aWwgdGhlIG5leHQgcG9zc2libGUgYW5pbWF0aW9uIGZyYW1lLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RhcnQoX21vZGU6IExPT1BfTU9ERSA9IExPT1BfTU9ERS5GUkFNRV9SRVFVRVNULCBfZnBzOiBudW1iZXIgPSA2MCwgX3N5bmNXaXRoQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBMb29wLnN0b3AoKTtcclxuXHJcbiAgICAgICAgICAgIExvb3AudGltZVN0YXJ0R2FtZSA9IFRpbWUuZ2FtZS5nZXQoKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lU3RhcnRSZWFsID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZUdhbWUgPSBMb29wLnRpbWVTdGFydEdhbWU7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWwgPSBMb29wLnRpbWVTdGFydFJlYWw7XHJcbiAgICAgICAgICAgIExvb3AuZnBzRGVzaXJlZCA9IChfbW9kZSA9PSBMT09QX01PREUuRlJBTUVfUkVRVUVTVCkgPyA2MCA6IF9mcHM7XHJcbiAgICAgICAgICAgIExvb3AuZnJhbWVzVG9BdmVyYWdlID0gTG9vcC5mcHNEZXNpcmVkO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVHYW1lQXZnID0gTG9vcC50aW1lTGFzdEZyYW1lUmVhbEF2ZyA9IDEwMDAgLyBMb29wLmZwc0Rlc2lyZWQ7XHJcbiAgICAgICAgICAgIExvb3AubW9kZSA9IF9tb2RlO1xyXG4gICAgICAgICAgICBMb29wLnN5bmNXaXRoQW5pbWF0aW9uRnJhbWUgPSBfc3luY1dpdGhBbmltYXRpb25GcmFtZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2c6IHN0cmluZyA9IGBMb29wIHN0YXJ0aW5nIGluIG1vZGUgJHtMb29wLm1vZGV9YDtcclxuICAgICAgICAgICAgaWYgKExvb3AubW9kZSAhPSBMT09QX01PREUuRlJBTUVfUkVRVUVTVClcclxuICAgICAgICAgICAgICAgIGxvZyArPSBgIHdpdGggYXR0ZW1wdGVkICR7X2Zwc30gZnBzYDtcclxuICAgICAgICAgICAgRGVidWcubG9nKGxvZyk7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKF9tb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5GUkFNRV9SRVFVRVNUOlxyXG4gICAgICAgICAgICAgICAgICAgIExvb3AubG9vcEZyYW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5USU1FX1JFQUw6XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5pZEludGVydmFsbCA9IHdpbmRvdy5zZXRJbnRlcnZhbChMb29wLmxvb3BUaW1lLCAxMDAwIC8gTG9vcC5mcHNEZXNpcmVkKTtcclxuICAgICAgICAgICAgICAgICAgICBMb29wLmxvb3BUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5USU1FX0dBTUU6XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5pZEludGVydmFsbCA9IFRpbWUuZ2FtZS5zZXRJbnRlcnZhbChMb29wLmxvb3BUaW1lLCAxMDAwIC8gTG9vcC5mcHNEZXNpcmVkKTtcclxuICAgICAgICAgICAgICAgICAgICBMb29wLmxvb3BUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBMb29wLnJ1bm5pbmcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcHMgdGhlIGxvb3BcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0b3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICghTG9vcC5ydW5uaW5nKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChMb29wLm1vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgTE9PUF9NT0RFLkZSQU1FX1JFUVVFU1Q6XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKExvb3AuaWRSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTE9PUF9NT0RFLlRJTUVfUkVBTDpcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChMb29wLmlkSW50ZXJ2YWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoTG9vcC5pZFJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMT09QX01PREUuVElNRV9HQU1FOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IERBTkdFUiEgaWQgY2hhbmdlcyBpbnRlcm5hbGx5IGluIGdhbWUgd2hlbiB0aW1lIGlzIHNjYWxlZCFcclxuICAgICAgICAgICAgICAgICAgICBUaW1lLmdhbWUuY2xlYXJJbnRlcnZhbChMb29wLmlkSW50ZXJ2YWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoTG9vcC5pZFJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRGVidWcubG9nKFwiTG9vcCBzdG9wcGVkIVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnBzR2FtZUF2ZXJhZ2UoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIDEwMDAgLyBMb29wLnRpbWVMYXN0RnJhbWVHYW1lQXZnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZwc1JlYWxBdmVyYWdlKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiAxMDAwIC8gTG9vcC50aW1lTGFzdEZyYW1lUmVhbEF2ZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGxvb3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCB0aW1lOiBudW1iZXI7XHJcbiAgICAgICAgICAgIHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lRnJhbWVSZWFsID0gdGltZSAtIExvb3AudGltZUxhc3RGcmFtZVJlYWw7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWwgPSB0aW1lO1xyXG5cclxuICAgICAgICAgICAgdGltZSA9IFRpbWUuZ2FtZS5nZXQoKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lRnJhbWVHYW1lID0gdGltZSAtIExvb3AudGltZUxhc3RGcmFtZUdhbWU7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZUdhbWUgPSB0aW1lO1xyXG5cclxuICAgICAgICAgICAgTG9vcC50aW1lTGFzdEZyYW1lR2FtZUF2ZyA9ICgoTG9vcC5mcmFtZXNUb0F2ZXJhZ2UgLSAxKSAqIExvb3AudGltZUxhc3RGcmFtZUdhbWVBdmcgKyBMb29wLnRpbWVGcmFtZUdhbWUpIC8gTG9vcC5mcmFtZXNUb0F2ZXJhZ2U7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWxBdmcgPSAoKExvb3AuZnJhbWVzVG9BdmVyYWdlIC0gMSkgKiBMb29wLnRpbWVMYXN0RnJhbWVSZWFsQXZnICsgTG9vcC50aW1lRnJhbWVSZWFsKSAvIExvb3AuZnJhbWVzVG9BdmVyYWdlO1xyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50OiBFdmVudCA9IG5ldyBFdmVudChFVkVOVC5MT09QX0ZSQU1FKTtcclxuICAgICAgICAgICAgTG9vcC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBsb29wRnJhbWUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIExvb3AubG9vcCgpO1xyXG4gICAgICAgICAgICBMb29wLmlkUmVxdWVzdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoTG9vcC5sb29wRnJhbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgbG9vcFRpbWUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChMb29wLnN5bmNXaXRoQW5pbWF0aW9uRnJhbWUpXHJcbiAgICAgICAgICAgICAgICBMb29wLmlkUmVxdWVzdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoTG9vcC5sb29wKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgTG9vcC5sb29wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNYXBGaWxlbmFtZVRvQ29udGVudCB7XHJcbiAgICAgICAgW2ZpbGVuYW1lOiBzdHJpbmddOiBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgZmlsZSB0cmFuc2ZlciBmcm9tIGEgRnVkZ2UtQnJvd3NlcmFwcCB0byB0aGUgbG9jYWwgZmlsZXN5c3RlbSB3aXRob3V0IGEgbG9jYWwgc2VydmVyLiAgXHJcbiAgICAgKiBTYXZlcyB0byB0aGUgZG93bmxvYWQtcGF0aCBnaXZlbiBieSB0aGUgYnJvd3NlciwgbG9hZHMgZnJvbSB0aGUgcGxheWVyJ3MgY2hvaWNlLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsZUlvQnJvd3NlckxvY2FsIGV4dGVuZHMgRXZlbnRUYXJnZXRTdGF0aWMge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNlbGVjdG9yOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIC8vIFRPRE86IHJlZmFjdG9yIHRvIGFzeW5jIGZ1bmN0aW9uIHRvIGJlIGhhbmRsZWQgdXNpbmcgcHJvbWlzZSwgaW5zdGVhZCBvZiB1c2luZyBldmVudCB0YXJnZXRcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3RvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLnR5cGUgPSBcImZpbGVcIjtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLm11bHRpcGxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLmhpZGRlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIEZpbGVJb0Jyb3dzZXJMb2NhbC5oYW5kbGVGaWxlU2VsZWN0KTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IuY2xpY2soKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHJlZmFjdG9yIHRvIGFzeW5jIGZ1bmN0aW9uIHRvIGJlIGhhbmRsZWQgdXNpbmcgcHJvbWlzZSwgaW5zdGVhZCBvZiB1c2luZyBldmVudCB0YXJnZXRcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNhdmUoX3RvU2F2ZTogTWFwRmlsZW5hbWVUb0NvbnRlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZW5hbWUgaW4gX3RvU2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZyA9IF90b1NhdmVbZmlsZW5hbWVdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJsb2I6IEJsb2IgPSBuZXcgQmxvYihbY29udGVudF0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsOiBzdHJpbmcgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgICAgICAgICAgICAgIC8vKi8gdXNpbmcgYW5jaG9yIGVsZW1lbnQgZm9yIGRvd25sb2FkXHJcbiAgICAgICAgICAgICAgICBsZXQgZG93bmxvYWRlcjogSFRNTEFuY2hvckVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcclxuICAgICAgICAgICAgICAgIGRvd25sb2FkZXIuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb3dubG9hZGVyKTtcclxuICAgICAgICAgICAgICAgIGRvd25sb2FkZXIuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG93bmxvYWRlcik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KEVWRU5ULkZJTEVfU0FWRUQsIHsgZGV0YWlsOiB7IG1hcEZpbGVuYW1lVG9Db250ZW50OiBfdG9TYXZlIH0gfSk7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGhhbmRsZUZpbGVTZWxlY3QoX2V2ZW50OiBFdmVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhhbmRsZUZpbGVTZWxlY3RcIik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yKTtcclxuICAgICAgICAgICAgbGV0IGZpbGVMaXN0OiBGaWxlTGlzdCA9ICg8SFRNTElucHV0RWxlbWVudD5fZXZlbnQudGFyZ2V0KS5maWxlcztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZUxpc3QsIGZpbGVMaXN0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlTGlzdC5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZWQ6IE1hcEZpbGVuYW1lVG9Db250ZW50ID0ge307XHJcbiAgICAgICAgICAgIGF3YWl0IEZpbGVJb0Jyb3dzZXJMb2NhbC5sb2FkRmlsZXMoZmlsZUxpc3QsIGxvYWRlZCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KEVWRU5ULkZJTEVfTE9BREVELCB7IGRldGFpbDogeyBtYXBGaWxlbmFtZVRvQ29udGVudDogbG9hZGVkIH0gfSk7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGxvYWRGaWxlcyhfZmlsZUxpc3Q6IEZpbGVMaXN0LCBfbG9hZGVkOiBNYXBGaWxlbmFtZVRvQ29udGVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlIG9mIF9maWxlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgbmV3IFJlc3BvbnNlKGZpbGUpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgIF9sb2FkZWRbZmlsZS5uYW1lXSA9IGNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=