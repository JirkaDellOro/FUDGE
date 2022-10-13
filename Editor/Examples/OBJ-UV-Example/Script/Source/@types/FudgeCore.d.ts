/// <reference path="../../Physics/OIMOPhysics.d.ts" />
declare namespace FudgeCore {
    /**
     * Base class for the different DebugTargets, mainly for technical purpose of inheritance
     */
    abstract class DebugTarget {
        delegates: MapDebugFilterToDelegate;
        static mergeArguments(_message: Object, ..._args: Object[]): string;
    }
}
declare namespace FudgeCore {
    /**
     * The filters corresponding to debug activities, more to come
     */
    enum DEBUG_FILTER {
        NONE = 0,
        INFO = 1,
        LOG = 2,
        WARN = 4,
        ERROR = 8,
        FUDGE = 16,
        CLEAR = 256,
        GROUP = 257,
        GROUPCOLLAPSED = 258,
        GROUPEND = 260,
        SOURCE = 512,
        MESSAGES = 31,
        FORMAT = 263,
        ALL = 287
    }
    const DEBUG_SYMBOL: {
        [filter: number]: string;
    };
    type MapDebugTargetToDelegate = Map<DebugTarget, Function>;
    interface MapDebugFilterToDelegate {
        [filter: number]: Function;
    }
}
declare namespace FudgeCore {
    /**
     * Routing to the standard-console
     */
    class DebugConsole extends DebugTarget {
        static delegates: MapDebugFilterToDelegate;
        /**
         * Should be used to display uncritical state information of FUDGE, only visible in browser's verbose mode
         */
        static fudge(_message: Object, ..._args: Object[]): void;
        /**
         * Displays an extra line with information about the source of the debug message
         */
        static source(_message: Object, ..._args: Object[]): void;
    }
}
declare namespace FudgeCore {
    /**
     * The Debug-Class offers functions known from the console-object and additions,
     * routing the information to various {@link DebugTarget}s that can be easily defined by the developers and registerd by users
     * Override functions in subclasses of {@link DebugTarget} and register them as their delegates
     */
    class Debug {
        /**
         * For each set filter, this associative array keeps references to the registered delegate functions of the chosen {@link DebugTarget}s
         */
        private static delegates;
        /**
         * De- / Activate a filter for the given DebugTarget.
         */
        static setFilter(_target: DebugTarget, _filter: DEBUG_FILTER): void;
        /**
         * Info(...) displays additional information with low priority
         */
        static info(_message: unknown, ..._args: unknown[]): void;
        /**
         * Displays information with medium priority
         */
        static log(_message: unknown, ..._args: unknown[]): void;
        /**
         * Displays information about non-conformities in usage, which is emphasized e.g. by color
         */
        static warn(_message: unknown, ..._args: unknown[]): void;
        /**
         * Displays critical information about failures, which is emphasized e.g. by color
         */
        static error(_message: unknown, ..._args: unknown[]): void;
        /**
         * Displays messages from FUDGE
         */
        static fudge(_message: unknown, ..._args: unknown[]): void;
        /**
         * Clears the output and removes previous messages if possible
         */
        static clear(): void;
        /**
         * Opens a new group for messages
         */
        static group(_name: string): void;
        /**
         * Opens a new group for messages that is collapsed at first
         */
        static groupCollapsed(_name: string): void;
        /**
         * Closes the youngest group
         */
        static groupEnd(): void;
        /**
         * Log a branch of the node hierarchy
         */
        static branch(_branch: Node): void;
        /**
         * Displays messages about the source of the debug call
         */
        static source(_message: unknown, ..._args: unknown[]): void;
        /**
         * Lookup all delegates registered to the filter and call them using the given arguments
         */
        private static delegate;
        /**
         * setup routing to standard console
         */
        private static setupConsole;
    }
}
declare namespace FudgeCore {
    interface MapEventTypeToListener {
        [eventType: string]: EventListenerƒ[];
    }
    /**
     * Types of events specific to Fudge, in addition to the standard DOM/Browser-Types and custom strings
     */
    const enum EVENT {
        /** dispatched to targets registered at {@link Loop}, when requested animation frame starts */
        LOOP_FRAME = "loopFrame",
        /** dispatched to a {@link Component} when its being added to a {@link Node} */
        COMPONENT_ADD = "componentAdd",
        /** dispatched to a {@link Component} when its being removed from a {@link Node} */
        COMPONENT_REMOVE = "componentRemove",
        /** dispatched to a {@link Component} when its being activated */
        COMPONENT_ACTIVATE = "componentActivate",
        /** dispatched to a {@link Component} when its being deactivated */
        COMPONENT_DEACTIVATE = "componentDeactivate",
        /** dispatched to a {@link Node}, it's successors and ancestors when its being activated */
        NODE_ACTIVATE = "nodeActivate",
        /** dispatched to a {@link Node}, it's successors and ancestors when its being deactivated */
        NODE_DEACTIVATE = "nodeDeactivate",
        /** dispatched to a child {@link Node} and its ancestors after it was appended to a parent */
        CHILD_APPEND = "childAppend",
        /** dispatched to a child {@link Node} and its ancestors just before its being removed from its parent */
        CHILD_REMOVE = "childRemove",
        /** dispatched to a {@link Mutable} when it mutates */
        MUTATE = "mutate",
        /** dispatched to a {@link GraphInstance} when the graph it connects to mutates */
        MUTATE_GRAPH = "mutateGraph",
        /** dispatched to a {@link GraphInstance} after {@link MUTATE_GRAPH} to signal that all instances were informed*/
        MUTATE_GRAPH_DONE = "mutateGraphDone",
        /** dispatched to {@link Viewport} when it gets the focus to receive keyboard input */
        FOCUS_IN = "focusin",
        /** dispatched to {@link Viewport} when it loses the focus to receive keyboard input */
        FOCUS_OUT = "focusout",
        /** dispatched to {@link Node} when it's done serializing */
        NODE_SERIALIZED = "nodeSerialized",
        /** dispatched to {@link Node} when it's done deserializing, so all components, children and attributes are available */
        NODE_DESERIALIZED = "nodeDeserialized",
        /** dispatched to {@link GraphInstance} when it's content is set according to a serialization of a {@link Graph}  */
        GRAPH_INSTANTIATED = "graphInstantiated",
        /** dispatched to a {@link Graph} when it's finished deserializing  */
        GRAPH_DESERIALIZED = "graphDeserialized",
        /** dispatched to {@link Time} when it's scaling changed  */
        TIME_SCALED = "timeScaled",
        /** dispatched to {@link FileIoBrowserLocal} when a list of files has been loaded  */
        FILE_LOADED = "fileLoaded",
        /** dispatched to {@link FileIoBrowserLocal} when a list of files has been saved */
        FILE_SAVED = "fileSaved",
        /** dispatched to {@link Node} when recalculating transforms for render */
        RENDER_PREPARE = "renderPrepare",
        /** dispatched to {@link Viewport} and {@link Node} when recalculation of the branch to render starts. */
        RENDER_PREPARE_START = "renderPrepareStart",
        /** dispatched to {@link Viewport} and {@link Node} when recalculation of the branch to render ends. The branch dispatches before the lights are transmitted to the shaders  */
        RENDER_PREPARE_END = "renderPrepareEnd",
        /** dispatched to {@link Joint}-Components in order to disconnect */
        DISCONNECT_JOINT = "disconnectJoint",
        /** dispatched to {@link Node} when it gets attached to a viewport for rendering */
        ATTACH_BRANCH = "attachBranch",
        /** dispatched to {@link Project} when it's done loading resources from a url */
        RESOURCES_LOADED = "resourcesLoaded"
    }
    type EventListenerƒ = ((_event: EventPointer) => void) | ((_event: EventDragDrop) => void) | ((_event: EventWheel) => void) | ((_event: EventKeyboard) => void) | ((_event: Eventƒ) => void) | ((_event: EventPhysics) => void) | ((_event: CustomEvent) => void) | EventListenerOrEventListenerObject;
    type Eventƒ = EventPointer | EventDragDrop | EventWheel | EventKeyboard | Event | EventPhysics | CustomEvent;
    class EventTargetƒ extends EventTarget {
        addEventListener(_type: string, _handler: EventListenerƒ, _options?: boolean | AddEventListenerOptions): void;
        removeEventListener(_type: string, _handler: EventListenerƒ, _options?: boolean | AddEventListenerOptions): void;
        dispatchEvent(_event: Eventƒ): boolean;
    }
    /**
     * Base class for EventTarget singletons, which are fixed entities in the structure of Fudge, such as the core loop
     */
    class EventTargetStatic extends EventTargetƒ {
        protected static targetStatic: EventTargetStatic;
        protected constructor();
        static addEventListener(_type: string, _handler: EventListener): void;
        static removeEventListener(_type: string, _handler: EventListener): void;
        static dispatchEvent(_event: Event): boolean;
    }
}
declare namespace FudgeCore {
    /**
     * Interface describing the datatypes of the attributes a mutator as strings
     */
    interface MutatorAttributeTypes {
        [attribute: string]: string | Object;
    }
    /**
     * Interface describing a mutator, which is an associative array with names of attributes and their corresponding values
     */
    interface Mutator {
        [attribute: string]: General;
    }
    interface MutatorForAnimation extends Mutator {
        readonly forAnimation: null;
    }
    interface MutatorForUserInterface extends Mutator {
        readonly forUserInterface: null;
    }
    /**
     * Collect applicable attributes of the instance and copies of their values in a Mutator-object
     */
    function getMutatorOfArbitrary(_object: Object): Mutator;
    /**
     * Base class for all types being mutable using {@link Mutator}-objects, thus providing and using interfaces created at runtime.
     * Mutables provide a {@link Mutator} that is build by collecting all object-properties that are either of a primitive type or again Mutable.
     * Subclasses can either reduce the standard {@link Mutator} built by this base class by deleting properties or implement an individual getMutator-method.
     * The provided properties of the {@link Mutator} must match public properties or getters/setters of the object.
     * Otherwise, they will be ignored if not handled by an override of the mutate-method in the subclass and throw errors in an automatically generated user-interface for the object.
     */
    abstract class Mutable extends EventTargetƒ {
        /**
         * Decorator allows to attach {@link Mutable} functionality to existing classes.
         */
        static getMutatorFromPath(_mutator: Mutator, _path: string[]): Mutator;
        /**
         * Retrieves the type of this mutable subclass as the name of the runtime class
         * @returns The type of the mutable
         */
        get type(): string;
        /**
         * Collect applicable attributes of the instance and copies of their values in a Mutator-object.
         * By default, a mutator cannot be extended, since extensions are not available in the object the mutator belongs to.
         * A mutator may be reduced by the descendants of {@link Mutable} to contain only the properties needed.
         */
        getMutator(_extendable?: boolean): Mutator;
        /**
         * Collect the attributes of the instance and their values applicable for animation.
         * Basic functionality is identical to {@link getMutator}, returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForAnimation(): MutatorForAnimation;
        /**
         * Collect the attributes of the instance and their values applicable for the user interface.
         * Basic functionality is identical to {@link getMutator}, returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForUserInterface(): MutatorForUserInterface;
        /**
         * Collect the attributes of the instance and their values applicable for indiviualization by the component.
         * Basic functionality is identical to {@link getMutator}, returned mutator should then be reduced by the subclassed instance
         */
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * Does not recurse into objects!
         */
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator
         */
        updateMutator(_mutator: Mutator): void;
        /**
         * Updates the attribute values of the instance according to the state of the mutator.
         * The mutation may be restricted to a subset of the mutator and the event dispatching suppressed.
         * Uses mutateBase, but can be overwritten in subclasses
         */
        mutate(_mutator: Mutator, _selection?: string[], _dispatchMutate?: boolean): Promise<void>;
        /**
         * Base method for mutation, always available to subclasses. Do not overwrite in subclasses!
         */
        protected mutateBase(_mutator: Mutator, _selection?: string[]): Promise<void>;
        /**
         * Reduces the attributes of the general mutator according to desired options for mutation. To be implemented in subclasses
         * @param _mutator
         */
        protected abstract reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    type General = any;
    interface Serialization {
        [type: string]: General;
    }
    interface Serializable {
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
    /**
     * Handles the external serialization and deserialization of {@link Serializable} objects. The internal process is handled by the objects themselves.
     * A {@link Serialization} object can be created from a {@link Serializable} object and a JSON-String may be created from that.
     * Vice versa, a JSON-String can be parsed to a {@link Serialization} which can be deserialized to a {@link Serializable} object.
     * ```plaintext
     *  [Serializable] → (serialize) → [Serialization] → (stringify) → [String] → (save or send)
     *                                        ↓                            ↓                  ↓
     *                [Serializable] ← (deserialize) ← [Serialization] ← (parse) ← (load) ← [Medium]
     * ```
     * While the internal serialize/deserialize method1s of the objects care of the selection of information needed to recreate the object and its structure,
     * the {@link Serializer} keeps track of the namespaces and classes in order to recreate {@link Serializable} objects. The general structure of a {@link Serialization} is as follows
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
    abstract class Serializer {
        /** In order for the Serializer to create class instances, it needs access to the appropriate namespaces */
        private static namespaces;
        /**
         * Registers a namespace to the {@link Serializer}, to enable automatic instantiation of classes defined within
         * @param _namespace
         */
        static registerNamespace(_namespace: Object): string;
        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the {@link Serializable} interface
         */
        static serialize(_object: Serializable): Serialization;
        /**
         * Returns a FUDGE-object reconstructed from the information in the {@link Serialization} given,
         * including attached components, children, superclass-objects
         * @param _serialization
         */
        static deserialize(_serialization: Serialization): Promise<Serializable>;
        /**
         * Returns an Array of javascript object representing the serializable FUDGE-objects given in the array,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the {@link Serializable} interface
         */
        static serializeArray<T extends Serializable>(_type: new () => T, _objects: Serializable[]): Serialization;
        /**
         * Returns an Array of FUDGE-objects reconstructed from the information in the array of {@link Serialization}s given,
         * including attached components, children, superclass-objects
         * @param _serializations
         */
        static deserializeArray(_serialization: Serialization): Promise<Serializable[]>;
        static prettify(_json: string): string;
        /**
         * Returns a formatted, human readable JSON-String, representing the given {@link Serialization} that may have been created by {@link Serializer}.serialize
         * @param _serialization
         */
        static stringify(_serialization: Serialization): string;
        /**
         * Returns a {@link Serialization} created from the given JSON-String. Result may be passed to {@link Serializer.deserialize}
         * @param _json
         */
        static parse(_json: string): Serialization;
        /**
         * Creates an object of the class defined with the full path including the namespaceName(s) and the className seperated by dots(.)
         * @param _path
         */
        static reconstruct(_path: string): Serializable;
        static getConstructor<T extends Serializable>(_path: string): new () => T;
        /**
         * Returns the full path to the class of the object, if found in the registered namespaces
         * @param _object
         */
        private static getFullPath;
        /**
         * Returns the namespace-object defined within the full path, if registered
         * @param _path
         */
        private static getNamespace;
        /**
         * Finds the namespace-object in properties of the parent-object (e.g. window), if present
         * @param _namespace
         * @param _parent
         */
        private static findNamespaceIn;
    }
}
declare namespace FudgeCore {
    /**
     * Superclass for all {@link Component}s that can be attached to {@link Node}s.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020 | Jascha Karagöl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    abstract class Component extends Mutable implements Serializable {
        #private;
        /** subclasses get a iSubclass number for identification */
        static readonly iSubclass: number;
        /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
        static readonly baseClass: typeof Component;
        /** list of all the subclasses derived from this class, if they registered properly*/
        static readonly subclasses: typeof Component[];
        protected singleton: boolean;
        protected active: boolean;
        constructor();
        protected static registerSubclass(_subclass: typeof Component): number;
        get isActive(): boolean;
        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        get isSingleton(): boolean;
        /**
         * Retrieves the node, this component is currently attached to
         */
        get node(): Node | null;
        activate(_on: boolean): void;
        /**
         * Tries to attach the component to the given node, removing it from the node it was attached to if applicable
         */
        attachToNode(_container: Node | null): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Wraps a regular Javascript Array and offers very limited functionality geared solely towards avoiding garbage colletion.
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Recycler
     */
    class RecycableArray<T> {
        #private;
        get length(): number;
        /**
         * Sets the virtual length of the array to zero but keeps the entries beyond.
         */
        reset(): void;
        recycle(): void;
        push(_entry: T): number;
        pop(): T;
        /**
         * Recycles the object following the last in the array and increases the array length
         * It must be assured, that none of the objects in the array is still in any use of any kind!
         */
        [Symbol.iterator](): IterableIterator<T>;
        getSorted(_sort: (a: T, b: T) => number): T[];
    }
}
declare namespace FudgeCore {
    class RenderInjector {
        static inject(_constructor: Function, _injector: typeof RenderInjector): void;
    }
}
declare namespace FudgeCore {
    class RenderInjectorShader {
        static decorate(_constructor: Function): void;
        static useProgram(this: typeof Shader): void;
        static deleteProgram(this: typeof Shader): void;
        protected static createProgram(this: typeof Shader): void;
    }
}
declare namespace FudgeCore {
    class RenderInjectorCoat extends RenderInjector {
        static decorate(_constructor: Function): void;
        protected static injectCoatColored(this: CoatColored, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
        protected static injectCoatRemissive(this: CoatRemissive, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
        protected static injectCoatTextured(this: CoatTextured, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
        protected static injectCoatRemissiveTextured(this: CoatRemissiveTextured, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
    }
}
declare namespace FudgeCore {
    class RenderInjectorMesh {
        static decorate(_constructor: Function): void;
        protected static getRenderBuffers(this: Mesh, _shader: typeof Shader): RenderBuffers;
        protected static useRenderBuffers(this: Mesh, _shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number): RenderBuffers;
        protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void;
    }
}
declare namespace FudgeCore {
    interface Recycable {
        recycle(): void;
    }
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.
     * Using {@link Recycler} reduces load on the carbage collector and thus supports smooth performance.
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Recycler
     */
    abstract class Recycler {
        private static depot;
        /**
         * Fetches an object of the requested type from the depot, calls its recycle-method and returns it.
         * If the depot for that type is empty it returns a new object of the requested type
         * @param _T The class identifier of the desired object
         */
        static get<T extends Recycable | RecycableArray<T>>(_T: new () => T): T;
        /**
         * Returns a reference to an object of the requested type in the depot, but does not remove it there.
         * If no object of the requested type was in the depot, one is created, stored and borrowed.
         * For short term usage of objects in a local scope, when there will be no other call to Recycler.get or .borrow!
         * @param _T The class identifier of the desired object
         */
        static borrow<T extends Recycable>(_T: new () => T): T;
        /**
         * Stores the object in the depot for later recycling. Users are responsible for throwing in objects that are about to loose scope and are not referenced by any other
         * @param _instance
         */
        static store(_instance: Object): void;
        /**
         * Emptys the depot of a given type, leaving the objects for the garbage collector. May result in a short stall when many objects were in
         * @param _T
         */
        static dump<T>(_T: new () => T): void;
        /**
         * Emptys all depots, leaving all objects to the garbage collector. May result in a short stall when many objects were in
         */
        static dumpAll(): void;
    }
}
declare namespace FudgeCore {
    /**
     * Stores and manipulates a twodimensional vector comprised of the components x and y
     * ```plaintext
     *            +y
     *             |__ +x
     * ```
     * @authors Lukas Scheuerle, Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector2 extends Mutable implements Recycable {
        private data;
        constructor(_x?: number, _y?: number);
        /**
         * A shorthand for writing `new Vector2(0, 0)`.
         * @returns A new vector with the values (0, 0)
         */
        static ZERO(): Vector2;
        /**
         * A shorthand for writing `new Vector2(_scale, _scale)`.
         * @param _scale the scale of the vector. Default: 1
         */
        static ONE(_scale?: number): Vector2;
        /**
         * A shorthand for writing `new Vector2(0, y)`.
         * @param _scale The number to write in the y coordinate. Default: 1
         * @returns A new vector with the values (0, _scale)
         */
        static Y(_scale?: number): Vector2;
        /**
         * A shorthand for writing `new Vector2(x, 0)`.
         * @param _scale The number to write in the x coordinate. Default: 1
         * @returns A new vector with the values (_scale, 0)
         */
        static X(_scale?: number): Vector2;
        static TRANSFORMATION(_vector: Vector2, _mtxTransform: Matrix3x3, _includeTranslation?: boolean): Vector2;
        /**
         * Normalizes a given vector to the given length without editing the original vector.
         * @param _vector the vector to normalize
         * @param _length the length of the resulting vector. defaults to 1
         * @returns a new vector representing the normalised vector scaled by the given length
         */
        static NORMALIZATION(_vector: Vector2, _length?: number): Vector2;
        /**
         * Returns a new vector representing the given vector scaled by the given scaling factor
         */
        static SCALE(_vector: Vector2, _scale: number): Vector2;
        /**
         * Returns the resulting vector attained by addition of all given vectors.
         */
        static SUM(..._vectors: Vector2[]): Vector2;
        /**
         * Returns the result of the subtraction of two vectors.
         */
        static DIFFERENCE(_minuend: Vector2, _subtrahend: Vector2): Vector2;
        /**
         * Computes the dotproduct of 2 vectors.
         */
        static DOT(_a: Vector2, _b: Vector2): number;
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSS(_a: Vector2, _b: Vector2): number;
        /**
         * Calculates the orthogonal vector to the given vector. Rotates counterclockwise by default.
         * ```plaintext
         * ↑ => ← => ↓ => → => ↑
         * ```
         * @param _vector Vector to get the orthogonal equivalent of
         * @param _clockwise Should the rotation be clockwise instead of the default counterclockwise? default: false
         * @returns A Vector that is orthogonal to and has the same magnitude as the given Vector.
         */
        static ORTHOGONAL(_vector: Vector2, _clockwise?: boolean): Vector2;
        /**
         * Creates a cartesian vector from polar coordinates
         */
        static GEO(_angle?: number, _magnitude?: number): Vector2;
        get x(): number;
        get y(): number;
        set x(_x: number);
        set y(_y: number);
        /**
         * Returns the length of the vector
         */
        get magnitude(): number;
        /**
         * Returns the square of the magnitude of the vector without calculating a square root. Faster for simple proximity evaluation.
         */
        get magnitudeSquared(): number;
        /**
         * @returns A deep copy of the vector.
         * TODO: rename this clone and create a new method copy, which copies the values from a vector given
         */
        get clone(): Vector2;
        /**
         * Returns a polar representation of this vector
         */
        get geo(): Geo2;
        /**
         * Adjust the cartesian values of this vector to represent the given as polar coordinates
         */
        set geo(_geo: Geo2);
        recycle(): void;
        /**
         * Returns true if the coordinates of this and the given vector are to be considered identical within the given tolerance
         * TODO: examine, if tolerance as criterium for the difference is appropriate with very large coordinate values or if _tolerance should be multiplied by coordinate value
         */
        equals(_compare: Vector2, _tolerance?: number): boolean;
        /**
         * Adds the given vector to the executing vector, changing the executor.
         * @param _addend The vector to add.
         */
        add(_addend: Vector2): void;
        /**
         * Subtracts the given vector from the executing vector, changing the executor.
         * @param _subtrahend The vector to subtract.
         */
        subtract(_subtrahend: Vector2): void;
        /**
         * Scales the Vector by the given _scalar.
         */
        scale(_scalar: number): void;
        /**
         * Normalizes this to the given length, 1 by default
         */
        normalize(_length?: number): void;
        /**
         * Defines the components of this vector with the given numbers
         */
        set(_x?: number, _y?: number): void;
        /**
         * @returns An array of the data of the vector
         */
        get(): Float32Array;
        transform(_mtxTransform: Matrix3x3, _includeTranslation?: boolean): void;
        /**
         * For each dimension, moves the component to the minimum of this and the given vector
         */
        min(_compare: Vector3): void;
        /**
         * For each dimension, moves the component to the maximum of this and the given vector
         */
        max(_compare: Vector3): void;
        /**
         * Adds a z-component of the given magnitude (default=0) to the vector and returns a new Vector3
         */
        toVector3(_z?: number): Vector3;
        toString(): string;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Vector2>;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Defines the origin of a rectangle
     */
    enum ORIGIN2D {
        TOPLEFT = 0,
        TOPCENTER = 1,
        TOPRIGHT = 2,
        CENTERLEFT = 16,
        CENTER = 17,
        CENTERRIGHT = 18,
        BOTTOMLEFT = 32,
        BOTTOMCENTER = 33,
        BOTTOMRIGHT = 34
    }
    /**
     * Defines a rectangle with position and size and add comfortable methods to it
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Rectangle extends Mutable implements Recycable {
        position: Vector2;
        size: Vector2;
        constructor(_x?: number, _y?: number, _width?: number, _height?: number, _origin?: ORIGIN2D);
        /**
         * Returns a new rectangle created with the given parameters
         */
        static GET(_x?: number, _y?: number, _width?: number, _height?: number, _origin?: ORIGIN2D): Rectangle;
        get x(): number;
        get y(): number;
        get width(): number;
        get height(): number;
        /**
         * Return the leftmost expansion, respecting also negative values of width
         */
        get left(): number;
        /**
         * Return the topmost expansion, respecting also negative values of height
         */
        get top(): number;
        /**
         * Return the rightmost expansion, respecting also negative values of width
         */
        get right(): number;
        /**
         * Return the lowest expansion, respecting also negative values of height
         */
        get bottom(): number;
        set x(_x: number);
        set y(_y: number);
        set width(_width: number);
        set height(_height: number);
        set left(_value: number);
        set top(_value: number);
        set right(_value: number);
        set bottom(_value: number);
        get clone(): Rectangle;
        recycle(): void;
        copy(_rect: Rectangle): void;
        /**
         * Sets the position and size of the rectangle according to the given parameters
         */
        setPositionAndSize(_x?: number, _y?: number, _width?: number, _height?: number, _origin?: ORIGIN2D): void;
        pointToRect(_point: Vector2, _target: Rectangle): Vector2;
        /**
         * Returns true if the given point is inside of this rectangle or on the border
         * @param _point
         */
        isInside(_point: Vector2): boolean;
        /**
         * Returns true if this rectangle collides with the rectangle given
         * @param _rect
         */
        collides(_rect: Rectangle): boolean;
        /**
         * Returns the rectangle created by the intersection of this and the given rectangle or null, if they don't collide
         */
        getIntersection(_rect: Rectangle): Rectangle;
        /**
     * Returns the rectangle created by the intersection of this and the given rectangle or null, if they don't collide
     */
        covers(_rect: Rectangle): boolean;
        /**
         * Creates a string representation of this rectangle
         */
        toString(): string;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    let fudgeConfig: General;
    type RenderTexture = WebGLTexture;
    enum BLEND {
        OPAQUE = 0,
        TRANSPARENT = 1,
        PARTICLE = 2
    }
    interface BufferSpecification {
        size: number;
        dataType: number;
        normalize: boolean;
        stride: number;
        offset: number;
    }
    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through {@link Render}
     */
    abstract class RenderWebGL extends EventTargetStatic {
        protected static crc3: WebGL2RenderingContext;
        protected static ƒpicked: Pick[];
        private static rectRender;
        private static sizePick;
        /**
         * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
         */
        static initialize(_antialias?: boolean, _alpha?: boolean): WebGL2RenderingContext;
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation  The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification  Interface passing datapullspecifications to the buffer.
         */
        static setAttributeStructure(_attributeLocation: number, _bufferSpecification: BufferSpecification): void;
        /**
        * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
        * @param _value  value to check against null
        * @param _message  optional, additional message for the exception
        */
        static assert<T>(_value: T | null, _message?: string): T;
        /**
         * Return a reference to the offscreen-canvas
         */
        static getCanvas(): HTMLCanvasElement;
        /**
         * Return a reference to the rendering context
         */
        static getRenderingContext(): WebGL2RenderingContext;
        /**
         * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
         */
        static getCanvasRect(): Rectangle;
        /**
         * Set the size of the offscreen-canvas.
         */
        static setCanvasSize(_width: number, _height: number): void;
        /**
         * Set the area on the offscreen-canvas to render the camera image to.
         * @param _rect
         */
        static setRenderRectangle(_rect: Rectangle): void;
        /**
         * Clear the offscreen renderbuffer with the given {@link Color}
         */
        static clear(_color?: Color): void;
        /**
         * Reset the offscreen framebuffer to the original RenderingContext
         */
        static resetFrameBuffer(_color?: Color): void;
        /**
         * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
         */
        static getRenderRectangle(): Rectangle;
        static setDepthTest(_test: boolean): void;
        static setBlendMode(_mode: BLEND): void;
        /**
         * Creates a texture buffer to be used as pick-buffer
         */
        protected static createPickTexture(_size: number): RenderTexture;
        protected static getPicks(_size: number, _cmpCamera: ComponentCamera): Pick[];
        /**
        * The render function for picking a single node.
        * A cameraprojection with extremely narrow focus is used, so each pixel of the buffer would hold the same information from the node,
        * but the fragment shader renders only 1 pixel for each node into the render buffer, 1st node to 1st pixel, 2nd node to second pixel etc.
        */
        protected static pick(_node: Node, _mtxMeshToWorld: Matrix4x4, _cmpCamera: ComponentCamera): void;
        /**
         * Set light data in shaders
         */
        protected static setLightsInShader(_shader: typeof Shader, _lights: MapLightTypeToLightList): void;
        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         */
        protected static drawNode(_node: Node, _cmpCamera: ComponentCamera): void;
        private static calcMeshToView;
        private static getRenderBuffers;
    }
}
declare namespace FudgeCore {
    class RenderInjectorTexture extends RenderInjector {
        static decorate(_constructor: Function): void;
        protected static injectTexture(this: Texture): void;
    }
}
declare namespace FudgeCore {
    interface MapClassToComponents {
        [className: string]: Component[];
    }
    /**
     * Represents a node in the scenetree.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Graph
     */
    class Node extends EventTargetƒ implements Serializable {
        #private;
        name: string;
        readonly mtxWorld: Matrix4x4;
        timestampUpdate: number;
        /** The number of nodes of the whole branch including this node and all successors */
        nNodesInBranch: number;
        /** The radius of the bounding sphere in world dimensions enclosing the geometry of this node and all successors in the branch */
        radius: number;
        private parent;
        private children;
        private components;
        private listeners;
        private captures;
        private active;
        /**
         * Creates a new node with a name and initializes all attributes
         */
        constructor(_name: string);
        get isActive(): boolean;
        /**
         * Shortcut to retrieve this nodes {@link ComponentTransform}
         */
        get cmpTransform(): ComponentTransform;
        /**
         * Shortcut to retrieve the local {@link Matrix4x4} attached to this nodes {@link ComponentTransform}
         * Fails if no {@link ComponentTransform} is attached
         */
        get mtxLocal(): Matrix4x4;
        get mtxWorldInverse(): Matrix4x4;
        /**
         * Returns the number of children attached to this
         */
        get nChildren(): number;
        /**
         * Generator yielding the node and all decendants in the graph below for iteration
         * Inactive nodes and their descendants can be filtered
         */
        getIterator(_active?: boolean): IterableIterator<Node>;
        [Symbol.iterator](): IterableIterator<Node>;
        activate(_on: boolean): void;
        /**
         * Returns a reference to this nodes parent node
         */
        getParent(): Node | null;
        /**
         * Traces back the ancestors of this node and returns the first
         */
        getAncestor(): Node | null;
        /**
         * Traces the hierarchy upwards to the first ancestor and returns the path through the graph to this node
         */
        getPath(): Node[];
        /**
         * Returns child at the given index in the list of children
         */
        getChild(_index: number): Node;
        /**
         * Returns a clone of the list of children
         */
        getChildren(): Node[];
        /**
         * Returns an array of references to childnodes with the supplied name.
         */
        getChildrenByName(_name: string): Node[];
        /**
         * Simply calls {@link addChild}. This reference is here solely because appendChild is the equivalent method in DOM.
         * See and preferably use {@link addChild}
         */
        readonly appendChild: (_child: Node) => void;
        /**
         * Adds the given reference to a node to the list of children, if not already in
         * @throws Error when trying to add an ancestor of this
         */
        addChild(_child: Node): void;
        /**
         * Removes the reference to the give node from the list of children
         */
        removeChild(_child: Node): void;
        /**
         * Removes all references in the list of children
         */
        removeAllChildren(): void;
        /**
         * Returns the position of the node in the list of children or -1 if not found
         */
        findChild(_search: Node): number;
        /**
         * Replaces a child node with another, preserving the position in the list of children
         */
        replaceChild(_replace: Node, _with: Node): boolean;
        isUpdated(_timestampUpdate: number): boolean;
        isDescendantOf(_ancestor: Node): boolean;
        /**
         * Applies a Mutator from {@link Animation} to all its components and transfers it to its children.
         */
        applyAnimation(_mutator: Mutator): void;
        /**
         * Returns a list of all components attached to this node, independent of type.
         */
        getAllComponents(): Component[];
        /**
         * Returns a clone of the list of components of the given class attached to this node.
         */
        getComponents<T extends Component>(_class: new () => T): T[];
        /**
         * Returns the first compontent found of the given class attached this node or null, if list is empty or doesn't exist
         */
        getComponent<T extends Component>(_class: new () => T): T;
        /**
         * Attach the given component to this node. Identical to {@link addComponent}
         */
        attach(_component: Component): void;
        /**
         * Attach the given component to this node
         */
        addComponent(_component: Component): void;
        /**
         * Detach the given component from this node. Identical to {@link removeComponent}
         */
        detach(_component: Component): void;
        /**
         * Removes the given component from the node, if it was attached, and sets its parent to null.
         */
        removeComponent(_component: Component): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        /**
         * Creates a string as representation of this node and its descendants
         */
        toHierarchyString(_node?: Node, _level?: number): string;
        /**
         * Adds an event listener to the node. The given handler will be called when a matching event is passed to the node.
         * Deviating from the standard EventTarget, here the _handler must be a function and _capture is the only option.
         */
        addEventListener(_type: EVENT | string, _handler: EventListenerƒ, _capture?: boolean): void;
        /**
         * Removes an event listener from the node. The signature must match the one used with addEventListener
         */
        removeEventListener(_type: EVENT | string, _handler: EventListenerƒ, _capture?: boolean): void;
        /**
         * Dispatches a synthetic event to target. This implementation always returns true (standard: return true only if either event's cancelable attribute value is false or its preventDefault() method was not invoked)
         * The event travels into the hierarchy to this node dispatching the event, invoking matching handlers of the nodes ancestors listening to the capture phase,
         * than the matching handler of the target node in the target phase, and back out of the hierarchy in the bubbling phase, invoking appropriate handlers of the anvestors
         */
        dispatchEvent(_event: Event): boolean;
        /**
         * Dispatches a synthetic event to target without travelling through the graph hierarchy neither during capture nor bubbling phase
         */
        dispatchEventToTargetOnly(_event: Event): boolean;
        /**
         * Broadcasts a synthetic event to this node and from there to all nodes deeper in the hierarchy,
         * invoking matching handlers of the nodes listening to the capture phase. Watch performance when there are many nodes involved
         */
        broadcastEvent(_event: Event): void;
        private broadcastEventRecursive;
        private callListeners;
    }
}
declare namespace FudgeCore {
    const enum EVENT_PHYSICS {
        TRIGGER_ENTER = "TriggerEnteredCollision",
        TRIGGER_EXIT = "TriggerLeftCollision",
        COLLISION_ENTER = "ColliderEnteredCollision",
        COLLISION_EXIT = "ColliderLeftCollision"
    }
    class EventPhysics extends Event {
        /**
         * ComponentRigidbody that collided with this ComponentRigidbody
         */
        cmpRigidbody: ComponentRigidbody;
        /**
         * The normal impulse between the two colliding objects. Normal represents the default impulse.
         * Impulse is only happening on COLLISION_ENTER, so there is no impulse on exit nor on triggers.
         * Use the velocity of the cmpRigidbody to determine the intensity of the EVENT instead.
         */
        normalImpulse: number;
        tangentImpulse: number;
        binomalImpulse: number;
        /** The point where the collision/triggering initially happened. The collision point exists only on COLLISION_ENTER / TRIGGER_ENTER. */
        collisionPoint: Vector3;
        /** The normal vector of the collision. Only existing on COLLISION_ENTER */
        collisionNormal: Vector3;
        /** Creates a new event customized for physics. Holding informations about impulses. Collision point and the body that is colliding */
        constructor(_type: EVENT_PHYSICS, _hitRigidbody: ComponentRigidbody, _normalImpulse: number, _tangentImpulse: number, _binormalImpulse: number, _collisionPoint?: Vector3, _collisionNormal?: Vector3);
    }
    /**
    * Groups to place a node in, not every group should collide with every group. Use a Mask in to exclude collisions
    */
    enum COLLISION_GROUP {
        DEFAULT = 1,
        GROUP_1 = 2,
        GROUP_2 = 4,
        GROUP_3 = 8,
        GROUP_4 = 16,
        GROUP_5 = 32
    }
    /**
    * Defines the type of the rigidbody which determines the way it interacts with the physical and the visual world
    */
    enum BODY_TYPE {
        /** The body ignores the hierarchy of the render graph, is completely controlled  by physics and takes its node with it  */
        DYNAMIC = 0,
        /** The body ignores the hierarchy of the render graph, is completely immoveble and keeps its node from moving  */
        STATIC = 1,
        /** The body is controlled by its node and moves with it, while it impacts the physical world e.g. by collisions */
        KINEMATIC = 2
    }
    /**
    * Different types of collider shapes, with different options in scaling BOX = Vector3(length, height, depth),
    * SPHERE = Vector3(diameter, x, x), CAPSULE = Vector3(diameter, height, x), CYLINDER = Vector3(diameter, height, x),
    * CONE = Vector(diameter, height, x), PYRAMID = Vector3(length, height, depth); x == unused.
    * CONVEX = ComponentMesh needs to be available in the RB Property convexMesh, the points of that component are used to create a collider that matches,
    * the closest possible representation of that form, in form of a hull. Convex is experimental and can produce unexpected behaviour when vertices
    * are too close to one another and the given vertices do not form a in itself closed shape and having a genus of 0 (no holes). Vertices in the ComponentMesh can be scaled differently
    * for texturing/normal or other reasons, so the collider might be off compared to the visual shape, this can be corrected by changing the pivot scale of the ComponentRigidbody.
    */
    enum COLLIDER_TYPE {
        CUBE = 0,
        SPHERE = 1,
        CAPSULE = 2,
        CYLINDER = 3,
        CONE = 4,
        PYRAMID = 5,
        CONVEX = 6
    }
    /** Displaying different types of debug information about different physic features. Default = JOINTS_AND_COLLIDER. */
    enum PHYSICS_DEBUGMODE {
        NONE = 0,
        COLLIDERS = 1,
        JOINTS_AND_COLLIDER = 2,
        BOUNDING_BOXES = 3,
        CONTACTS = 4,
        PHYSIC_OBJECTS_ONLY = 5
    }
    /** Info about Raycasts shot from the physics system. */
    class RayHitInfo {
        hit: boolean;
        hitDistance: number;
        hitPoint: Vector3;
        rigidbodyComponent: ComponentRigidbody;
        hitNormal: Vector3;
        rayEnd: Vector3;
        rayOrigin: Vector3;
        constructor();
        recycle(): void;
    }
    /** General settings for the physic simulation and the debug of it. */
    class PhysicsSettings {
        constructor(_defaultCollisionGroup: number, _defaultCollisionMask: number);
        /** Change if rigidbodies are able to sleep (don't be considered in physical calculations) when their movement is below a threshold. Deactivation is decreasing performance for minor advantage in precision. */
        get disableSleeping(): boolean;
        set disableSleeping(_value: boolean);
        /** Sleeping Threshold for Movement Veloctiy. */
        get sleepingVelocityThreshold(): number;
        set sleepingVelocityThreshold(_value: number);
        /** Sleeping Threshold for Rotation Velocity. */
        get sleepingAngularVelocityThreshold(): number;
        set sleepingAngularVelocityThreshold(_value: number);
        /** Threshold how long the Rigidbody must be below/above the threshold to count as sleeping. */
        get sleepingTimeThreshold(): number;
        set sleepingTimeThreshold(_value: number);
        /** Error threshold. Default is 0.05. The higher the more likely collisions get detected before actual impact at high speeds but it's visually less accurate. */
        get defaultCollisionMargin(): number;
        set defaultCollisionMargin(_thickness: number);
        /** The default applied friction between two rigidbodies with the default value. How much velocity is slowed down when moving accross this surface. */
        get defaultFriction(): number;
        set defaultFriction(_value: number);
        /** Bounciness of rigidbodies. How much of the impact is restituted. */
        get defaultRestitution(): number;
        set defaultRestitution(_value: number);
        /** Groups the default rigidbody will collide with. Set it like: (PHYSICS_GROUP.DEFAULT | PHYSICS_GROUP.GROUP_1 | PHYSICS_GROUP.GROUP_2 | PHYSICS_GROUP.GROUP_3)
         * to collide with multiple groups. Default is collision with everything but triggers.
        */
        get defaultCollisionMask(): number;
        set defaultCollisionMask(_value: number);
        /** The group that this rigidbody belongs to. Default is the DEFAULT Group which means its just a normal Rigidbody not a trigger nor anything special. */
        get defaultCollisionGroup(): COLLISION_GROUP;
        set defaultCollisionGroup(_value: COLLISION_GROUP);
        /** Change the type of joint solver algorithm. Default Iterative == 0, is faster but less stable. Direct == 1, slow but more stable, recommended for complex joint work. Change this setting only at the start of your game. */
        get defaultConstraintSolverType(): number;
        set defaultConstraintSolverType(_value: number);
        /** The correction algorithm used to correct physics calculations. Change this only at the beginning of your game. Each has different approaches, so if you have problems test another
         *  Default 0 = Baumgarte (fast but less correct induces some energy errors), 1 = Split-Impulse (fast and no engery errors, but more inaccurate for joints), 2 = Non-linear Gauss Seidel (slowest but most accurate)*/
        get defaultCorrectionAlgorithm(): number;
        set defaultCorrectionAlgorithm(_value: number);
        /** The precision of the simulation in form of number of iterations the simulations runs through until it accepts the result.
         *  10 Default - Higher means more precision but results in a performance decrease. This helps especially with joints,
         * but also the general stability of the simulation due to simulation steps being rechecked multiple times before being set.
         */
        get solverIterations(): number;
        set solverIterations(_value: number);
    }
}
declare namespace FudgeCore {
    /**
       * Acts as the physical representation of a connection between two {@link Node}'s.
       * The type of conncetion is defined by the subclasses like prismatic joint, cylinder joint etc.
       * A Rigidbody on the {@link Node} that this component is added to is needed. Setting the connectedRigidbody and
       * initializing the connection creates a physical connection between them. This differs from a connection through hierarchy
       * in the node structure of fudge. Joints can have different DOF's (Degrees Of Freedom), 1 Axis that can either twist or swing is a degree of freedom.
       * A joint typically consists of a motor that limits movement/rotation or is activly trying to move to a limit. And a spring which defines the rigidity.
       * @author Marko Fehrenbach, HFU 2020
       */
    abstract class Joint extends Component {
        #private;
        /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
        static readonly baseClass: typeof Joint;
        /** list of all the subclasses derived from this class, if they registered properly*/
        static readonly subclasses: typeof Joint[];
        protected singleton: boolean;
        protected abstract joint: OIMO.Joint;
        protected abstract config: OIMO.JointConfig;
        /** Create a joint connection between the two given RigidbodyComponents. */
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody);
        protected static registerSubclass(_subclass: typeof Joint): number;
        /** Get/Set the first ComponentRigidbody of this connection. It should always be the one that this component is attached too in the sceneTree. */
        get bodyAnchor(): ComponentRigidbody;
        set bodyAnchor(_cmpRB: ComponentRigidbody);
        /** Get/Set the second ComponentRigidbody of this connection. */
        get bodyTied(): ComponentRigidbody;
        set bodyTied(_cmpRB: ComponentRigidbody);
        /**
         * The exact position where the two {@link Node}s are connected. When changed after initialization the joint needs to be reconnected.
         */
        get anchor(): Vector3;
        set anchor(_value: Vector3);
        /**
         * The amount of force needed to break the JOINT, while rotating, in Newton. 0 equals unbreakable (default)
        */
        get breakTorque(): number;
        set breakTorque(_value: number);
        /**
         * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default)
         */
        get breakForce(): number;
        set breakForce(_value: number);
        /**
          * If the two connected RigidBodies collide with eath other. (Default = false)
          * On a welding joint the connected bodies should not be colliding with each other,
          * for best results
         */
        get internalCollision(): boolean;
        set internalCollision(_value: boolean);
        connectChild(_name: string): void;
        connectNode(_node: Node): void;
        /** Check if connection is dirty, so when either rb is changed disconnect and reconnect. Internally used no user interaction needed. */
        isConnected(): boolean;
        /**
         * Initializing and connecting the two rigidbodies with the configured joint properties
         * is automatically called by the physics system. No user interaction needed.
         */
        connect(): void;
        /**
         * Disconnecting the two rigidbodies and removing them from the physics system,
         * is automatically called by the physics system. No user interaction needed.
         */
        disconnect(): void;
        /**
         * Returns the original Joint used by the physics engine. Used internally no user interaction needed.
         * Only to be used when functionality that is not added within Fudge is needed.
        */
        getOimoJoint(): OIMO.Joint;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
        /** Tell the FudgePhysics system that this joint needs to be handled in the next frame. */
        protected dirtyStatus(): void;
        protected addJoint(): void;
        protected removeJoint(): void;
        protected constructJoint(..._configParams: Object[]): void;
        protected configureJoint(): void;
        protected deleteFromMutator(_mutator: Mutator, _delete: Mutator): void;
        private hndEvent;
    }
}
declare namespace FudgeCore {
    /**
       * Base class for joints operating with exactly one axis
       * @author Jirka Dell'Oro-Friedl, HFU, 2021
     */
    abstract class JointAxial extends Joint {
        #private;
        protected springDamper: OIMO.SpringDamper;
        /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _axis?: Vector3, _localAnchor?: Vector3);
        /**
         * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
         *  When changed after initialization the joint needs to be reconnected.
         */
        get axis(): Vector3;
        set axis(_value: Vector3);
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        get maxMotor(): number;
        set maxMotor(_value: number);
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        get minMotor(): number;
        set minMotor(_value: number);
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDamping(): number;
        set springDamping(_value: number);
        /**
          * The target speed of the motor in m/s.
         */
        get motorSpeed(): number;
        set motorSpeed(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequency(): number;
        set springFrequency(_value: number);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        getMutator(): Mutator;
        protected constructJoint(): void;
    }
}
declare function ifNumber(_check: number, _default: number): number;
declare namespace FudgeCore {
    /**
     * Holds information about the AnimationStructure that the Animation uses to map the Sequences to the Attributes.
     * Built out of a {@link Node}'s serialsation, it swaps the values with {@link AnimationSequence}s.
     */
    interface AnimationStructure {
        [attribute: string]: Serialization | AnimationSequence;
    }
    /**
    * An associative array mapping names of lables to timestamps.
    * Labels need to be unique per Animation.
    * @author Lukas Scheuerle, HFU, 2019
    */
    interface AnimationLabel {
        [name: string]: number;
    }
    /**
    * Holds information about Animation Event Triggers
    * @author Lukas Scheuerle, HFU, 2019
    */
    interface AnimationEventTrigger {
        [name: string]: number;
    }
    /**
     * Holds different playmodes the animation uses to play back its animation.
     * @author Lukas Scheuerle, HFU, 2019
     */
    enum ANIMATION_PLAYMODE {
        /**Plays animation in a loop: it restarts once it hit the end.*/
        LOOP = 0,
        /**Plays animation once and stops at the last key/frame*/
        PLAYONCE = 1,
        /**Plays animation once and stops on the first key/frame */
        PLAYONCESTOPAFTER = 2,
        /**Plays animation like LOOP, but backwards.*/
        REVERSELOOP = 3,
        /**Causes the animation not to play at all. Useful for jumping to various positions in the animation without proceeding in the animation.*/
        STOP = 4
    }
    enum ANIMATION_PLAYBACK {
        /**Calculates the state of the animation at the exact position of time. Ignores FPS value of animation.*/
        TIMEBASED_CONTINOUS = 0,
        /**Limits the calculation of the state of the animation to the FPS value of the animation. Skips frames if needed.*/
        TIMEBASED_RASTERED_TO_FPS = 1,
        /** Advances the time each frame according to the FPS value of the animation, ignoring the actual duration of the frames. Doesn't skip any frames.*/
        FRAMEBASED = 2
    }
    /**
     * Animation Class to hold all required Objects that are part of an Animation.
     * Also holds functions to play said Animation.
     * Can be added to a Node and played through {@link ComponentAnimator}.
     * @author Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Animation extends Mutable implements SerializableResource {
        idResource: string;
        name: string;
        totalTime: number;
        labels: AnimationLabel;
        animationStructure: AnimationStructure;
        events: AnimationEventTrigger;
        private framesPerSecond;
        private eventsProcessed;
        private animationStructuresProcessed;
        constructor(_name: string, _animStructure?: AnimationStructure, _fps?: number);
        get getLabels(): Enumerator;
        get fps(): number;
        set fps(_fps: number);
        /**
         * Generates a new "Mutator" with the information to apply to the {@link Node} the {@link ComponentAnimator} is attached to with {@link Node.applyAnimation}.
         * @param _time The time at which the animation currently is at
         * @param _direction The direction in which the animation is supposed to be playing back. >0 == forward, 0 == stop, <0 == backwards
         * @param _playback The playbackmode the animation is supposed to be calculated with.
         * @returns a "Mutator" to apply.
         */
        getMutated(_time: number, _direction: number, _playback: ANIMATION_PLAYBACK): Mutator;
        /**
         * Returns a list of the names of the events the {@link ComponentAnimator} needs to fire between _min and _max.
         * @param _min The minimum time (inclusive) to check between
         * @param _max The maximum time (exclusive) to check between
         * @param _playback The playback mode to check in. Has an effect on when the Events are fired.
         * @param _direction The direction the animation is supposed to run in. >0 == forward, 0 == stop, <0 == backwards
         * @returns a list of strings with the names of the custom events to fire.
         */
        getEventsToFire(_min: number, _max: number, _playback: ANIMATION_PLAYBACK, _direction: number): string[];
        /**
         * Adds an Event to the List of events.
         * @param _name The name of the event (needs to be unique per Animation).
         * @param _time The timestamp of the event (in milliseconds).
         */
        setEvent(_name: string, _time: number): void;
        /**
         * Removes the event with the given name from the list of events.
         * @param _name name of the event to remove.
         */
        removeEvent(_name: string): void;
        /**
         * (Re-)Calculate the total time of the Animation. Calculation-heavy, use only if actually needed.
         */
        calculateTotalTime(): void;
        /**
         * Returns the time to use for animation sampling when applying a playmode
         */
        getModalTime(_time: number, _playmode: ANIMATION_PLAYMODE, _timeStop?: number): number;
        /**
         * Calculates and returns the direction the animation should currently be playing in.
         * @param _time the time at which to calculate the direction
         * @returns 1 if forward, 0 if stop, -1 if backwards
         */
        calculateDirection(_time: number, _playmode: ANIMATION_PLAYMODE): number;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
        /**
         * Traverses an AnimationStructure and returns the Serialization of said Structure.
         * @param _structure The Animation Structure at the current level to transform into the Serialization.
         * @returns the filled Serialization.
         */
        private traverseStructureForSerialisation;
        /**
         * Traverses a Serialization to create a new AnimationStructure.
         * @param _serialization The serialization to transfer into an AnimationStructure
         * @returns the newly created AnimationStructure.
         */
        private traverseStructureForDeserialisation;
        /**
         * Finds the list of events to be used with these settings.
         * @param _direction The direction the animation is playing in.
         * @param _playback The playbackmode the animation is playing in.
         * @returns The correct AnimationEventTrigger Object to use
         */
        private getCorrectEventList;
        /**
         * Traverses an AnimationStructure to turn it into the "Mutator" to return to the Component.
         * @param _structure The strcuture to traverse
         * @param _time the point in time to write the animation numbers into.
         * @returns The "Mutator" filled with the correct values at the given time.
         */
        private traverseStructureForMutator;
        /**
         * Traverses the current AnimationStrcuture to find the totalTime of this animation.
         * @param _structure The structure to traverse
         */
        private traverseStructureForTime;
        /**
         * Ensures the existance of the requested {@link AnimationStrcuture} and returns it.
         * @param _type the type of the structure to get
         * @returns the requested {@link AnimationStructure]]
         */
        private getProcessedAnimationStructure;
        /**
         * Ensures the existance of the requested {@link AnimationEventTrigger} and returns it.
         * @param _type The type of AnimationEventTrigger to get
         * @returns the requested {@link AnimationEventTrigger]]
         */
        private getProcessedEventTrigger;
        /**
         * Traverses an existing structure to apply a recalculation function to the AnimationStructure to store in a new Structure.
         * @param _oldStructure The old structure to traverse
         * @param _functionToUse The function to use to recalculated the structure.
         * @returns A new Animation Structure with the recalulated Animation Sequences.
         */
        private traverseStructureForNewStructure;
        /**
         * Creates a reversed Animation Sequence out of a given Sequence.
         * @param _sequence The sequence to calculate the new sequence out of
         * @returns The reversed Sequence
         */
        private calculateReverseSequence;
        /**
         * Creates a rastered {@link AnimationSequence} out of a given sequence.
         * @param _sequence The sequence to calculate the new sequence out of
         * @returns the rastered sequence.
         */
        private calculateRasteredSequence;
        /**
         * Creates a new reversed {@link AnimationEventTrigger} object based on the given one.
         * @param _events the event object to calculate the new one out of
         * @returns the reversed event object
         */
        private calculateReverseEventTriggers;
        /**
         * Creates a rastered {@link AnimationEventTrigger} object based on the given one.
         * @param _events the event object to calculate the new one out of
         * @returns the rastered event object
         */
        private calculateRasteredEventTriggers;
        /**
         * Checks which events lay between two given times and returns the names of the ones that do.
         * @param _eventTriggers The event object to check the events inside of
         * @param _min the minimum of the range to check between (inclusive)
         * @param _max the maximum of the range to check between (exclusive)
         * @returns an array of the names of the events in the given range.
         */
        private checkEventsBetween;
    }
}
declare namespace FudgeCore {
    /**
     * Calculates the values between {@link AnimationKey}s.
     * Represented internally by a cubic function (`f(x) = ax³ + bx² + cx + d`).
     * Only needs to be recalculated when the keys change, so at runtime it should only be calculated once.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationFunction {
        private a;
        private b;
        private c;
        private d;
        private keyIn;
        private keyOut;
        constructor(_keyIn: AnimationKey, _keyOut?: AnimationKey);
        /**
         * Calculates the value of the function at the given time.
         * @param _time the point in time at which to evaluate the function in milliseconds. Will be corrected for offset internally.
         * @returns the value at the given time
         */
        evaluate(_time: number): number;
        set setKeyIn(_keyIn: AnimationKey);
        set setKeyOut(_keyOut: AnimationKey);
        /**
         * (Re-)Calculates the parameters of the cubic function.
         * See https://math.stackexchange.com/questions/3173469/calculate-cubic-equation-from-two-points-and-two-slopes-variably
         * and https://jirkadelloro.github.io/FUDGE/Documentation/Logs/190410_Notizen_LS
         */
        calculate(): void;
    }
}
declare namespace FudgeCore {
    /**
     * Holds information about set points in time, their accompanying values as well as their slopes.
     * Also holds a reference to the {@link AnimationFunction}s that come in and out of the sides. The {@link AnimationFunction}s are handled by the {@link AnimationSequence}s.
     * Saved inside an {@link AnimationSequence}.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationKey extends Mutable implements Serializable {
        /**Don't modify this unless you know what you're doing.*/
        functionIn: AnimationFunction;
        /**Don't modify this unless you know what you're doing.*/
        functionOut: AnimationFunction;
        broken: boolean;
        private time;
        private value;
        private constant;
        private slopeIn;
        private slopeOut;
        constructor(_time?: number, _value?: number, _slopeIn?: number, _slopeOut?: number, _constant?: boolean);
        /**
         * Static comparation function to use in an array sort function to sort the keys by their time.
         * @param _a the animation key to check
         * @param _b the animation key to check against
         * @returns >0 if a>b, 0 if a=b, <0 if a<b
         */
        static compare(_a: AnimationKey, _b: AnimationKey): number;
        get Time(): number;
        set Time(_time: number);
        get Value(): number;
        set Value(_value: number);
        get Constant(): boolean;
        set Constant(_constant: boolean);
        get SlopeIn(): number;
        set SlopeIn(_slope: number);
        get SlopeOut(): number;
        set SlopeOut(_slope: number);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * A sequence of {@link AnimationKey}s that is mapped to an attribute of a {@link Node} or its {@link Component}s inside the {@link Animation}.
     * Provides functions to modify said keys
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationSequence extends Mutable implements Serializable {
        private keys;
        get length(): number;
        /**
         * Evaluates the sequence at the given point in time.
         * @param _time the point in time at which to evaluate the sequence in milliseconds.
         * @returns the value of the sequence at the given time. 0 if there are no keys.
         */
        evaluate(_time: number): number;
        /**
         * Adds a new key to the sequence.
         * @param _key the key to add
         */
        addKey(_key: AnimationKey): void;
        /**
         * Removes a given key from the sequence.
         * @param _key the key to remove
         */
        removeKey(_key: AnimationKey): void;
        /**
         * Removes the Animation Key at the given index from the keys.
         * @param _index the zero-based index at which to remove the key
         * @returns the removed AnimationKey if successful, null otherwise.
         */
        removeKeyAtIndex(_index: number): AnimationKey;
        /**
         * Gets a key from the sequence at the desired index.
         * @param _index the zero-based index at which to get the key
         * @returns the AnimationKey at the index if it exists, null otherwise.
         */
        getKey(_index: number): AnimationKey;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
        /**
         * Utility function that (re-)generates all functions in the sequence.
         */
        private regenerateFunctions;
    }
}
declare namespace FudgeCore {
    /**
     * Extension of AudioBuffer with a load method that creates a buffer in the {@link AudioManager}.default to be used with {@link ComponentAudio}
     * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Audio extends Mutable implements SerializableResource {
        name: string;
        idResource: string;
        buffer: AudioBuffer;
        path: URL;
        private url;
        private ready;
        constructor(_url?: RequestInfo);
        get isReady(): boolean;
        /**
         * Asynchronously loads the audio (mp3) from the given url
         */
        load(_url: RequestInfo): Promise<void>;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Extends the standard AudioContext for integration with FUDGE-graphs.
     * Creates a default object at startup to be addressed as AudioManager default.
     * Other objects of this class may be create for special purposes.
     */
    class AudioManager extends AudioContext {
        /** The default context that may be used throughout the project without the need to create others */
        static readonly default: AudioManager;
        /** The master volume all AudioNodes in the context should attach to */
        readonly gain: GainNode;
        private graph;
        private cmpListener;
        constructor(contextOptions?: AudioContextOptions);
        /**
         * Set the master volume
         */
        set volume(_value: number);
        /**
         * Get the master volume
         */
        get volume(): number;
        /**
         * Determines FUDGE-graph to listen to. Each {@link ComponentAudio} in the graph will connect to this contexts master gain, all others disconnect.
         */
        listenTo: (_graph: Node | null) => void;
        /**
         * Retrieve the FUDGE-graph currently listening to
         */
        getGraphListeningTo: () => Node;
        /**
         * Set the {@link ComponentAudioListener} that serves the spatial location and orientation for this contexts listener
         */
        listenWith: (_cmpListener: ComponentAudioListener | null) => void;
        /**
         * Updates the spatial settings of the AudioNodes effected in the current FUDGE-graph
         */
        update: () => void;
    }
}
declare namespace FudgeCore {
    /**
     * Holds a reference to an {@link Animation} and controls it. Controls playback and playmode as well as speed.
     * @authors Lukas Scheuerle, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class ComponentAnimator extends Component {
        #private;
        static readonly iSubclass: number;
        animation: Animation;
        playmode: ANIMATION_PLAYMODE;
        playback: ANIMATION_PLAYBACK;
        scaleWithGameTime: boolean;
        constructor(_animation?: Animation, _playmode?: ANIMATION_PLAYMODE, _playback?: ANIMATION_PLAYBACK);
        set scale(_scale: number);
        get scale(): number;
        /**
         * Returns the current sample time of the animation
         */
        get time(): number;
        activate(_on: boolean): void;
        /**
         * Jumps to a certain time in the animation to play from there.
         */
        jumpTo(_time: number): void;
        /**
         * Jumps to a certain label in the animation if defined
         */
        jumpToLabel(_label: string): void;
        /**
         * Forces an update of the animation from outside. Used in the ViewAnimation. Shouldn't be used during the game.
         * @param _time the (unscaled) time to update the animation with.
         * @returns a Tupel containing the Mutator for Animation and the playmode corrected time.
         */
        updateAnimation(_time: number): [Mutator, number];
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        /**
         * Updates the Animation.
         * Gets called every time the Loop fires the LOOP_FRAME Event.
         * Uses the built-in time unless a different time is specified.
         * May also be called from updateAnimation().
         */
        private updateAnimationLoop;
        /**
         * Fires all custom events the Animation should have fired between the last frame and the current frame.
         * @param events a list of names of custom events to fire
         */
        private executeEvents;
        /**
         * Updates the scale of the animation if the user changes it or if the global game timer changed its scale.
         */
        private updateScale;
    }
}
declare namespace FudgeCore {
    enum AUDIO_PANNER {
        CONE_INNER_ANGLE = "coneInnerAngle",
        CONE_OUTER_ANGLE = "coneOuterAngle",
        CONE_OUTER_GAIN = "coneOuterGain",
        DISTANCE_MODEL = "distanceModel",
        MAX_DISTANCE = "maxDistance",
        PANNING_MODEL = "panningModel",
        REF_DISTANCE = "refDistance",
        ROLLOFF_FACTOR = "rolloffFactor"
    }
    enum AUDIO_NODE_TYPE {
        SOURCE = 0,
        PANNER = 1,
        GAIN = 2
    }
    /**
     * Builds a minimal audio graph (by default in {@link AudioManager}.default) and synchronizes it with the containing {@link Node}
     * ```plaintext
     * ┌ AudioManager(.default) ────────────────────────┐
     * │ ┌ ComponentAudio ───────────────────┐          │
     * │ │    ┌──────┐   ┌──────┐   ┌──────┐ │ ┌──────┐ │
     * │ │    │source│ → │panner│ → │ gain │ → │ gain │ │
     * │ │    └──────┘   └──────┘   └──────┘ │ └──────┘ │
     * │ └───────────────────────────────────┘          │
     * └────────────────────────────────────────────────┘
     * ```
     * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentAudio extends Component {
        static readonly iSubclass: number;
        /** places and directs the panner relative to the world transform of the {@link Node}  */
        mtxPivot: Matrix4x4;
        protected singleton: boolean;
        private audio;
        private gain;
        private panner;
        private source;
        private audioManager;
        private playing;
        private listened;
        constructor(_audio?: Audio, _loop?: boolean, _start?: boolean, _audioManager?: AudioManager);
        set volume(_value: number);
        get volume(): number;
        set loop(_on: boolean);
        get loop(): boolean;
        get isPlaying(): boolean;
        get isAttached(): boolean;
        get isListened(): boolean;
        setAudio(_audio: Audio): void;
        getAudio(): Audio;
        /**
         * Set the property of the panner to the given value. Use to manipulate range and rolloff etc.
         */
        setPanner(_property: AUDIO_PANNER, _value: number): void;
        getMutatorOfNode(_type: AUDIO_NODE_TYPE): Mutator;
        /**
         * Returns the specified AudioNode of the standard graph for further manipulation
         */
        getAudioNode(_type: AUDIO_NODE_TYPE): AudioNode;
        /**
         * Start or stop playing the audio
         */
        play(_on: boolean): void;
        /**
         * Inserts AudioNodes between the panner and the local gain of this {@link ComponentAudio}
         * _input and _output may be the same AudioNode, if there is only one to insert,
         * or may have multiple AudioNode between them to create an effect-graph.\
         * Note that {@link ComponentAudio} does not keep track of inserted AudioNodes!
         * ```plaintext
         * ┌ AudioManager(.default) ──────────────────────────────────────────────────────┐
         * │ ┌ ComponentAudio ─────────────────────────────────────────────────┐          │
         * │ │    ┌──────┐   ┌──────┐   ┌──────┐          ┌───────┐   ┌──────┐ │ ┌──────┐ │
         * │ │    │source│ → │panner│ → │_input│ → ...  → │_output│ → │ gain │ → │ gain │ │
         * │ │    └──────┘   └──────┘   └──────┘          └───────┘   └──────┘ │ └──────┘ │
         * │ └─────────────────────────────────────────────────────────────────┘          │
         * └──────────────────────────────────────────────────────────────────────────────┘
         * ```
         */
        insertAudioNodes(_input: AudioNode, _output: AudioNode): void;
        /**
         * Activate override. Connects or disconnects AudioNodes
         */
        activate(_on: boolean): void;
        /**
         * Connects this components gain-node to the gain node of the AudioManager this component runs on.
         * Only call this method if the component is not attached to a {@link Node} but needs to be heard.
         */
        connect(_on: boolean): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
        private hndAudioReady;
        private hndAudioEnded;
        private install;
        private createSource;
        private updateConnection;
        /**
         * Automatically connects/disconnects AudioNodes when adding/removing this component to/from a node.
         * Therefore unused AudioNodes may be garbage collected when an unused component is collected
         */
        private handleAttach;
        /**
         * Automatically connects/disconnects AudioNodes when appending/removing the FUDGE-graph the component is in.
         */
        private handleGraph;
        /**
         * Updates the panner node, its position and direction, using the worldmatrix of the container and the pivot of this component.
         */
        private update;
    }
}
declare namespace FudgeCore {
    /**
     * Serves to set the spatial location and orientation of AudioListeners relative to the
     * world transform of the {@link Node} it is attached to.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentAudioListener extends Component {
        static readonly iSubclass: number;
        mtxPivot: Matrix4x4;
        /**
         * Updates the position and orientation of the given AudioListener
         */
        update(_listener: AudioListener): void;
    }
}
declare namespace FudgeCore {
    enum FIELD_OF_VIEW {
        HORIZONTAL = 0,
        VERTICAL = 1,
        DIAGONAL = 2
    }
    /**
     * Defines identifiers for the various projections a camera can provide.
     * TODO: change back to number enum if strings not needed
     */
    enum PROJECTION {
        CENTRAL = "central",
        ORTHOGRAPHIC = "orthographic",
        DIMETRIC = "dimetric",
        STEREO = "stereo"
    }
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentCamera extends Component {
        #private;
        static readonly iSubclass: number;
        mtxPivot: Matrix4x4;
        clrBackground: Color;
        private projection;
        private mtxProjection;
        private fieldOfView;
        private aspectRatio;
        private direction;
        private near;
        private far;
        private backgroundEnabled;
        get mtxWorld(): Matrix4x4;
        /**
         * Returns the multiplication of the worldtransformation of the camera container, the pivot of this camera and the inversion of the projection matrix
         * yielding the worldspace to viewspace matrix
         */
        get mtxWorldToView(): Matrix4x4;
        resetWorldToView(): void;
        getProjection(): PROJECTION;
        getBackgroundEnabled(): boolean;
        getAspect(): number;
        getFieldOfView(): number;
        getDirection(): FIELD_OF_VIEW;
        getNear(): number;
        getFar(): number;
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        projectCentral(_aspect?: number, _fieldOfView?: number, _direction?: FIELD_OF_VIEW, _near?: number, _far?: number): void;
        /**
         * Set the camera to orthographic projection. Default values are derived the canvas client dimensions
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         */
        projectOrthographic(_left?: number, _right?: number, _bottom?: number, _top?: number): void;
        /**
         * Return the calculated dimension of a projection surface in the hypothetical distance of 1 to the camera
         */
        getProjectionRectangle(): Rectangle;
        pointWorldToClip(_pointInWorldSpace: Vector3): Vector3;
        pointClipToWorld(_pointInClipSpace: Vector3): Vector3;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Makes the node face the camera when rendering, respecting restrictions for rotation around specific axis
     * @authors Jirka Dell'Oro-Friedl, HFU, 2022
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    class ComponentFaceCamera extends Component {
        static readonly iSubclass: number;
        upLocal: boolean;
        up: Vector3;
        restrict: boolean;
        constructor();
    }
}
declare namespace FudgeCore {
    /**
     * Filters synchronization between a graph instance and the graph it is connected to. If active, no synchronization occurs.
     * Maybe more finegrained in the future...
     * @authors Jirka Dell'Oro-Friedl, HFU, 2022
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    class ComponentGraphFilter extends Component {
        static readonly iSubclass: number;
        constructor();
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    type TypeOfLight = new () => Light;
    /**
     * Baseclass for different kinds of lights.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Light extends Mutable implements Serializable {
        color: Color;
        constructor(_color?: Color);
        getType(): TypeOfLight;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(): void;
    }
    /**
     * Ambient light, coming from all directions, illuminating everything with its color independent of position and orientation (like a foggy day or in the shades)
     * Attached to a node by {@link ComponentLight}, the pivot matrix is ignored.
     * ```plaintext
     * ~ ~ ~
     *  ~ ~ ~
     * ```
     */
    class LightAmbient extends Light {
    }
    /**
     * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)
     * Attached to a node by {@link ComponentLight}, the pivot matrix specifies the direction of the light only.
     * ```plaintext
     * --->
     * --->
     * --->
     * ```
     */
    class LightDirectional extends Light {
    }
    /**
     * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)
     * Attached to a node by {@link ComponentLight}, the pivot matrix specifies the position of the light, it's shape and rotation.
     * So with uneven scaling, other shapes than a perfect sphere, such as an oval or a disc, are possible, which creates a visible effect of the rotation too.
     * The intensity of the light drops linearly from 1 in the center to 0 at the perimeter of the shape.
     * ```plaintext
     *         .\|/.
     *        -- o --
     *         ´/|\`
     * ```
     */
    class LightPoint extends Light {
    }
    /**
     * Spot light emitting within a specified angle from its position, illuminating objects depending on their position and distance with its color
     * Attached to a node by {@link ComponentLight}, the pivot matrix specifies the position of the light, the direction and the size and angles of the cone.
     * The intensity of the light drops linearly from 1 in the center to 0 at the outer limits of the cone.
     * ```plaintext
     *          o
     *         /|\
     *        / | \
     * ```
     */
    class LightSpot extends Light {
    }
}
declare namespace FudgeCore {
    /**
     * Defines identifiers for the various types of light this component can provide.
     */
    enum LIGHT_TYPE {
        AMBIENT = "LightAmbient",
        DIRECTIONAL = "LightDirectional",
        POINT = "LightPoint",
        SPOT = "LightSpot"
    }
    /**
      * Attaches a {@link Light} to the node
      * The pivot matrix has different effects depending on the type of the {@link Light}. See there for details.
      * @authors Jirka Dell'Oro-Friedl, HFU, 2019
      */
    class ComponentLight extends Component {
        static readonly iSubclass: number;
        mtxPivot: Matrix4x4;
        light: Light;
        constructor(_light?: Light);
        setType<T extends Light>(_class: new () => T): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        mutate(_mutator: Mutator): Promise<void>;
    }
}
declare namespace FudgeCore {
    /**
     * Attaches a {@link Material} to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
     */
    class ComponentMaterial extends Component {
        static readonly iSubclass: number;
        clrPrimary: Color;
        clrSecondary: Color;
        mtxPivot: Matrix3x3;
        material: Material;
        sortForAlpha: boolean;
        constructor(_material?: Material);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * Attaches a {@link Mesh} to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends Component {
        #private;
        static readonly iSubclass: number;
        mtxPivot: Matrix4x4;
        readonly mtxWorld: Matrix4x4;
        mesh: Mesh;
        constructor(_mesh?: Mesh, _skeleton?: SkeletonInstance);
        get radius(): number;
        get skeleton(): SkeletonInstance;
        bindSkeleton(_skeleton: SkeletonInstance): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutatorForUserInterface(): MutatorForUserInterface;
    }
}
declare namespace FudgeCore {
    enum PICK {
        RADIUS = "radius",
        CAMERA = "camera",
        PHYSICS = "physics"
    }
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2022
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    class ComponentPick extends Component {
        static readonly iSubclass: number;
        pick: PICK;
        pickAndDispatch(_ray: Ray, _event: PointerEvent): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
    }
}
declare namespace FudgeCore {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    class ComponentScript extends Component {
        static readonly iSubclass: number;
        constructor();
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    enum BASE {
        SELF = 0,
        PARENT = 1,
        WORLD = 2,
        NODE = 3
    }
    /**
     * Attaches a transform-[[Matrix4x4} to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends Component {
        static readonly iSubclass: number;
        mtxLocal: Matrix4x4;
        constructor(_mtxInit?: Matrix4x4);
        /**
         * recalculates this local matrix to yield the identical world matrix based on the given node.
         * Use rebase before appending the container of this component to another node while preserving its transformation in the world.
         */
        rebase(_node?: Node): void;
        /**
         * Applies the given transformation relative to the selected base (SELF, PARENT, WORLD) or a particular other node (NODE)
         */
        transform(_mtxTransform: Matrix4x4, _base?: BASE, _node?: Node): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    const enum EVENT_CONTROL {
        INPUT = "input",
        OUTPUT = "output"
    }
    const enum CONTROL_TYPE {
        /** The output simply follows the scaled and delayed input */
        PROPORTIONAL = 0,
        /** The output value changes over time with a rate given by the scaled and delayed input */
        INTEGRAL = 1,
        /** The output value reacts to changes of the scaled input and drops to 0 with given delay, if input remains constant */
        DIFFERENTIAL = 2
    }
    /**
     * Processes input signals of type number and generates an output signal of the same type using
     * proportional, integral or differential mapping, an amplification factor and a linear dampening/delay
     * ```plaintext
     *          ┌─────────────────────────────────────────────────────────────┐
     *          │   ┌───────┐   ┌─────┐      pass through (Proportional)      │
     *  Input → │ → │amplify│ → │delay│ → ⚟ sum up over time (Integral) ⚞ → │ → Output
     *          │   └───────┘   └─────┘      pass change  (Differential)      │
     *          └─────────────────────────────────────────────────────────────┘
     * ```
     */
    class Control extends EventTarget {
        readonly type: CONTROL_TYPE;
        active: boolean;
        name: string;
        protected rateDispatchOutput: number;
        protected valuePrevious: number;
        protected outputBase: number;
        protected outputTarget: number;
        protected outputPrevious: number;
        protected outputTargetPrevious: number;
        protected factor: number;
        protected time: Time;
        protected timeValueDelay: number;
        protected timeOutputTargetSet: number;
        protected idTimer: number;
        constructor(_name: string, _factor?: number, _type?: CONTROL_TYPE, _delay?: number);
        /**
         * Set the time-object to be used when calculating the output in {@link CONTROL_TYPE.INTEGRAL}
         */
        setTimebase(_time: Time): void;
        /**
         * Feed an input value into this control and fire the events {@link EVENT_CONTROL.INPUT} and {@link EVENT_CONTROL.OUTPUT}
         */
        setInput(_input: number): void;
        pulse(_input: number): void;
        /**
         * Set the time to take for the internal linear dampening until the final ouput value is reached
         */
        setDelay(_time: number): void;
        /**
         * Set the number of output-events to dispatch per second.
         * At the default of 0, the control output must be polled and will only actively dispatched once each time input occurs and the output changes.
         */
        setRateDispatchOutput(_rateDispatchOutput?: number): void;
        /**
         * Set the factor to multiply the input value given with {@link setInput} with
         */
        setFactor(_factor: number): void;
        /**
         * Get the value from the output of this control
         */
        getOutput(): number;
        /**
         * Calculates the output of this control
         */
        protected calculateOutput(): number;
        /**
         * calculates the output considering the time of the delay
         */
        private getValueDelayed;
        private dispatchOutput;
    }
}
declare namespace FudgeCore {
    /**
     * Handles multiple controls as inputs and creates an output from that.
     * As a subclass of {@link Control}, axis calculates the ouput summing up the inputs and processing the result using its own settings.
     * Dispatches {@link EVENT_CONTROL.OUTPUT} and {@link EVENT_CONTROL.INPUT} when one of the controls dispatches them.
     * ```plaintext
     *           ┌───────────────────────────────────────────┐
     *           │ ┌───────┐                                 │
     *   Input → │ │control│\                                │
     *           │ └───────┘ \                               │
     *           │ ┌───────┐  \┌───┐   ┌─────────────────┐   │
     *   Input → │ │control│---│sum│ → │internal control │ → │ → Output
     *           │ └───────┘  /└───┘   └─────────────────┘   │
     *           │ ┌───────┐ /                               │
     *   Input → │ │control│/                                │
     *           │ └───────┘                                 │
     *           └───────────────────────────────────────────┘
     * ```
     */
    class Axis extends Control {
        private controls;
        private sumPrevious;
        /**
         * Add the control given to the list of controls feeding into this axis
         */
        addControl(_control: Control): void;
        /**
         * Returns the control with the given name
         */
        getControl(_name: string): Control;
        /**
         * Removes the control with the given name
         */
        removeControl(_name: string): void;
        /**
         * Returns the value of this axis after summing up all inputs and processing the sum according to the axis' settings
         */
        getOutput(): number;
        private hndOutputEvent;
        private hndInputEvent;
    }
}
declare namespace FudgeCore {
    /**
     * Collects the keys pressed on the keyboard and stores their status.
     */
    abstract class Keyboard {
        private static keysPressed;
        /**
         * Returns true if one of the given keys is is currently being pressed.
         */
        static isPressedOne(_keys: KEYBOARD_CODE[]): boolean;
        /**
         * Returns true if all of the given keys are currently being pressed
         */
        static isPressedCombo(_keys: KEYBOARD_CODE[]): boolean;
        /**
         * Returns the value given as _active if one or, when _combo is true, all of the given keys are pressed.
         * Returns the value given as _inactive if not.
         */
        static mapToValue<T>(_active: T, _inactive: T, _keys: KEYBOARD_CODE[], _combo?: boolean): T;
        /**
         * Returns a balanced ternary value (either -1, 0 or 1)
         * according to the match of the keys currently being pressed and the lists of keys given
         */
        static mapToTrit(_positive: KEYBOARD_CODE[], _negative: KEYBOARD_CODE[]): number;
        private static initialize;
        private static hndKeyInteraction;
    }
}
declare namespace FudgeCore {
    /**
     * Routing to the alert box
     */
    class DebugAlert extends DebugTarget {
        static delegates: MapDebugFilterToDelegate;
        static createDelegate(_headline: string): Function;
    }
}
declare namespace FudgeCore {
    /**
     * Routing to a HTMLDialogElement
     */
    class DebugDialog extends DebugTarget {
    }
}
declare namespace FudgeCore {
    /**
     * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
     */
    class DebugTextArea extends DebugTarget {
        static textArea: HTMLTextAreaElement;
        static autoScroll: boolean;
        static delegates: MapDebugFilterToDelegate;
        private static groups;
        static clear(): void;
        static group(_name: string): void;
        static groupEnd(): void;
        static createDelegate(_headline: string): Function;
        private static getIndentation;
        private static print;
    }
}
declare namespace FudgeCore {
    const enum EVENT_AUDIO {
        /** broadcast to a {@link Node} and all its descendants in the graph after it was appended to a parent */
        CHILD_APPEND = "childAppendToAudioGraph",
        /** broadcast to a {@link Node} and all its descendants in the graph just before its being removed from its parent */
        CHILD_REMOVE = "childRemoveFromAudioGraph",
        /** broadcast to a {@link Node} and all its descendants in the graph to update the panners in AudioComponents */
        UPDATE = "updateAudioGraph",
        /** fired when the audio file was loaded and is ready for playing */
        READY = "ready",
        /** fired when the end of the audio is reached while playing */
        ENDED = "ended"
    }
}
declare namespace FudgeCore {
    const enum EVENT_DRAGDROP {
        DRAG = "\u0192drag",
        DROP = "\u0192drop",
        START = "\u0192dragstart",
        END = "\u0192dragend",
        OVER = "\u0192dragover"
    }
    /**
     * a subclass of DragEvent .A event that represents a drag and drop interaction
     */
    class EventDragDrop extends DragEvent {
        pointerX: number;
        pointerY: number;
        canvasX: number;
        canvasY: number;
        clientRect: ClientRect;
        constructor(type: string, _event: EventDragDrop);
    }
}
declare namespace FudgeCore {
    /**
     * a subclass of KeyboardEvent. EventKeyboard objects describe a user interaction with the keyboard
     * each event describes a single interaction between the user and a key (or combination of a key with modifier keys) on the keyboard.
     */
    class EventKeyboard extends KeyboardEvent {
        constructor(type: string, _event: EventKeyboard);
    }
    /**
     * Mappings of standard DOM/Browser-Events as passed from a canvas to the viewport
     */
    const enum EVENT_KEYBOARD {
        UP = "\u0192keyup",
        DOWN = "\u0192keydown",
        PRESS = "\u0192keypress"
    }
    /**
     * The codes sent from a standard english keyboard layout
     */
    enum KEYBOARD_CODE {
        A = "KeyA",
        B = "KeyB",
        C = "KeyC",
        D = "KeyD",
        E = "KeyE",
        F = "KeyF",
        G = "KeyG",
        H = "KeyH",
        I = "KeyI",
        J = "KeyJ",
        K = "KeyK",
        L = "KeyL",
        M = "KeyM",
        N = "KeyN",
        O = "KeyO",
        P = "KeyP",
        Q = "KeyQ",
        R = "KeyR",
        S = "KeyS",
        T = "KeyT",
        U = "KeyU",
        V = "KeyV",
        W = "KeyW",
        X = "KeyX",
        Y = "KeyY",
        Z = "KeyZ",
        ESC = "Escape",
        ZERO = "Digit0",
        ONE = "Digit1",
        TWO = "Digit2",
        THREE = "Digit3",
        FOUR = "Digit4",
        FIVE = "Digit5",
        SIX = "Digit6",
        SEVEN = "Digit7",
        EIGHT = "Digit8",
        NINE = "Digit9",
        MINUS = "Minus",
        EQUAL = "Equal",
        BACKSPACE = "Backspace",
        TABULATOR = "Tab",
        BRACKET_LEFT = "BracketLeft",
        BRACKET_RIGHT = "BracketRight",
        ENTER = "Enter",
        CTRL_LEFT = "ControlLeft",
        SEMICOLON = "Semicolon",
        QUOTE = "Quote",
        BACK_QUOTE = "Backquote",
        SHIFT_LEFT = "ShiftLeft",
        BACKSLASH = "Backslash",
        COMMA = "Comma",
        PERIOD = "Period",
        SLASH = "Slash",
        SHIFT_RIGHT = "ShiftRight",
        NUMPAD_MULTIPLY = "NumpadMultiply",
        ALT_LEFT = "AltLeft",
        SPACE = "Space",
        CAPS_LOCK = "CapsLock",
        F1 = "F1",
        F2 = "F2",
        F3 = "F3",
        F4 = "F4",
        F5 = "F5",
        F6 = "F6",
        F7 = "F7",
        F8 = "F8",
        F9 = "F9",
        F10 = "F10",
        PAUSE = "Pause",
        SCROLL_LOCK = "ScrollLock",
        NUMPAD7 = "Numpad7",
        NUMPAD8 = "Numpad8",
        NUMPAD9 = "Numpad9",
        NUMPAD_SUBTRACT = "NumpadSubtract",
        NUMPAD4 = "Numpad4",
        NUMPAD5 = "Numpad5",
        NUMPAD6 = "Numpad6",
        NUMPAD_ADD = "NumpadAdd",
        NUMPAD1 = "Numpad1",
        NUMPAD2 = "Numpad2",
        NUMPAD3 = "Numpad3",
        NUMPAD0 = "Numpad0",
        NUMPAD_DECIMAL = "NumpadDecimal",
        PRINT_SCREEN = "PrintScreen",
        INTL_BACK_SLASH = "IntlBackSlash",
        F11 = "F11",
        F12 = "F12",
        NUMPAD_EQUAL = "NumpadEqual",
        F13 = "F13",
        F14 = "F14",
        F15 = "F15",
        F16 = "F16",
        F17 = "F17",
        F18 = "F18",
        F19 = "F19",
        F20 = "F20",
        F21 = "F21",
        F22 = "F22",
        F23 = "F23",
        F24 = "F24",
        KANA_MODE = "KanaMode",
        LANG2 = "Lang2",
        LANG1 = "Lang1",
        INTL_RO = "IntlRo",
        CONVERT = "Convert",
        NON_CONVERT = "NonConvert",
        INTL_YEN = "IntlYen",
        NUMPAD_COMMA = "NumpadComma",
        UNDO = "Undo",
        PASTE = "Paste",
        MEDIA_TRACK_PREVIOUS = "MediaTrackPrevious",
        CUT = "Cut",
        COPY = "Copy",
        MEDIA_TRACK_NEXT = "MediaTrackNext",
        NUMPAD_ENTER = "NumpadEnter",
        CTRL_RIGHT = "ControlRight",
        AUDIO_VOLUME_MUTE = "AudioVolumeMute",
        LAUNCH_APP2 = "LaunchApp2",
        MEDIA_PLAY_PAUSE = "MediaPlayPause",
        MEDIA_STOP = "MediaStop",
        EJECT = "Eject",
        AUDIO_VOLUME_DOWN = "AudioVolumeDown",
        VOLUME_DOWN = "VolumeDown",
        AUDIO_VOLUME_UP = "AudioVolumeUp",
        VOLUME_UP = "VolumeUp",
        BROWSER_HOME = "BrowserHome",
        NUMPAD_DIVIDE = "NumpadDivide",
        ALT_RIGHT = "AltRight",
        HELP = "Help",
        NUM_LOCK = "NumLock",
        HOME = "Home",
        ARROW_UP = "ArrowUp",
        ARROW_RIGHT = "ArrowRight",
        ARROW_DOWN = "ArrowDown",
        ARROW_LEFT = "ArrowLeft",
        END = "End",
        PAGE_UP = "PageUp",
        PAGE_DOWN = "PageDown",
        INSERT = "Insert",
        DELETE = "Delete",
        META_LEFT = "Meta_Left",
        OS_LEFT = "OSLeft",
        META_RIGHT = "MetaRight",
        OS_RIGHT = "OSRight",
        CONTEXT_MENU = "ContextMenu",
        POWER = "Power",
        BROWSER_SEARCH = "BrowserSearch",
        BROWSER_FAVORITES = "BrowserFavorites",
        BROWSER_REFRESH = "BrowserRefresh",
        BROWSER_STOP = "BrowserStop",
        BROWSER_FORWARD = "BrowserForward",
        BROWSER_BACK = "BrowserBack",
        LAUNCH_APP1 = "LaunchApp1",
        LAUNCH_MAIL = "LaunchMail",
        LAUNCH_MEDIA_PLAYER = "LaunchMediaPlayer",
        FN = "Fn",
        AGAIN = "Again",
        PROPS = "Props",
        SELECT = "Select",
        OPEN = "Open",
        FIND = "Find",
        WAKE_UP = "WakeUp",
        NUMPAD_PARENT_LEFT = "NumpadParentLeft",
        NUMPAD_PARENT_RIGHT = "NumpadParentRight",
        SLEEP = "Sleep"
    }
    enum KEYBOARD_CODE_DE {
        Z = "KeyY",
        Y = "KeyZ",
        Ö = "Semicolon",
        Ä = "Quote",
        Ü = "BracketLeft",
        HASH = "Backslash",
        PLUS = "BracketRight",
        ß = "Minus",
        ACUTE = "Equal",
        LESS_THAN = "IntlBackSlash",
        MINUS = "Slash"
    }
}
declare namespace FudgeCore {
    const enum EVENT_POINTER {
        UP = "\u0192pointerup",
        DOWN = "\u0192pointerdown",
        MOVE = "\u0192pointermove",
        OVER = "\u0192pointerover",
        ENTER = "\u0192pointerenter",
        CANCEL = "\u0192pointercancel",
        OUT = "\u0192pointerout",
        LEAVE = "\u0192pointerleave",
        GOTCAPTURE = "\u0192gotpointercapture",
        LOSTCAPTURE = "\u0192lostpointercapture"
    }
    /**
     * a subclass of PointerEvent. The state of a DOM event produced by a pointer such as the geometry of the contact point
     * */
    class EventPointer extends PointerEvent {
        pointerX: number;
        pointerY: number;
        canvasX: number;
        canvasY: number;
        clientRect: ClientRect;
        constructor(type: string, _event: EventPointer);
    }
}
declare namespace FudgeCore {
    const enum EVENT_TIMER {
        CALL = "\u0192lapse"
    }
    /**
     * An event that represents a call from a Timer
     * */
    class EventTimer {
        type: EVENT_TIMER;
        target: Timer;
        arguments: Object[];
        firstCall: boolean;
        lastCall: boolean;
        count: number;
        constructor(_timer: Timer, ..._arguments: Object[]);
    }
}
declare namespace FudgeCore {
    const enum EVENT_WHEEL {
        WHEEL = "\u0192wheel"
    }
    /**
     * A supclass of WheelEvent. Events that occur due to the user moving a mouse wheel or similar input device.
     * */
    class EventWheel extends WheelEvent {
        constructor(type: string, _event: EventWheel);
    }
}
declare namespace FudgeCore {
    /**
     * A node managed by {@link Project} that functions as a template for {@link GraphInstance}s
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
     */
    class Graph extends Node implements SerializableResource {
        idResource: string;
        type: string;
        constructor(_name?: string);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        private hndMutate;
    }
}
declare namespace FudgeCore {
    class GraphInstance extends Node {
        #private;
        /**
         * This constructor allone will not create a reconstruction, but only save the id.
         * To create an instance of the graph, call reset on this or set with a graph as parameter.
         * Prefer Project.createGraphInstance(_graph).
         */
        constructor(_graph?: Graph);
        get idSource(): string;
        /**
         * Recreate this node from the {@link Graph} referenced
         */
        reset(): Promise<void>;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        connectToGraph(): Promise<void>;
        /**
         * Set this node to be a recreation of the {@link Graph} given
         */
        set(_graph: Graph): Promise<void>;
        /**
         * Retrieve the graph this instances refers to
         */
        get(): Graph;
        /**
         * Source graph mutated, reflect mutation in this instance
         */
        private hndMutationGraph;
        /**
         * This instance mutated, reflect mutation in source graph
         */
        private hndMutationInstance;
        private reflectMutation;
        private isFiltered;
    }
}
declare namespace FudgeCore {
    /**
     * Holds data to feed into a {@link Shader} to describe the surface of {@link Mesh}.
     * {@link Material}s reference {@link Coat} and {@link Shader}.
     * The method useRenderData will be injected by {@link RenderInjector} at runtime, extending the functionality of this class to deal with the renderer.
     */
    class Coat extends Mutable implements Serializable {
        protected renderData: {
            [key: string]: unknown;
        };
        useRenderData(_shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * The simplest {@link Coat} providing just a color
     */
    class CoatColored extends Coat {
        color: Color;
        constructor(_color?: Color);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * The simplest {@link Coat} providing just a color
     */
    class CoatRemissive extends CoatColored {
        specular: number;
        diffuse: number;
        constructor(_color?: Color, _diffuse?: number, _specular?: number);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * A {@link Coat} providing a texture and additional data for texturing
     */
    class CoatTextured extends CoatColored {
        texture: Texture;
        constructor(_color?: Color, _texture?: Texture);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * A {@link Coat} providing a texture and additional data for texturing
     */
    class CoatRemissiveTextured extends CoatTextured {
        specular: number;
        diffuse: number;
        constructor(_color?: Color, _texture?: Texture, _diffuse?: number, _specular?: number);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
     */
    class Color extends Mutable implements Serializable {
        private static crc2;
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(_r?: number, _g?: number, _b?: number, _a?: number);
        static getHexFromCSSKeyword(_keyword: string): string;
        static CSS(_keyword: string, _alpha?: number): Color;
        static MULTIPLY(_color1: Color, _color2: Color): Color;
        setNormRGBA(_r: number, _g: number, _b: number, _a: number): void;
        setBytesRGBA(_r: number, _g: number, _b: number, _a: number): void;
        getArray(): Float32Array;
        setArrayNormRGBA(_color: Float32Array): void;
        setArrayBytesRGBA(_color: Uint8ClampedArray): void;
        getArrayBytesRGBA(): Uint8ClampedArray;
        add(_color: Color): void;
        getCSS(): string;
        getHex(): string;
        setHex(_hex: string): void;
        copy(_color: Color): void;
        toString(): string;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Baseclass for materials. Combines a {@link Shader} with a compatible {@link Coat}
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material extends Mutable implements SerializableResource {
        #private;
        name: string;
        idResource: string;
        private shaderType;
        constructor(_name: string, _shader?: typeof Shader, _coat?: Coat);
        /**
         * Returns the currently referenced {@link Coat} instance
         */
        get coat(): Coat;
        /**
         * Makes this material reference the given {@link Coat} if it is compatible with the referenced {@link Shader}
         */
        set coat(_coat: Coat);
        /**
         * Creates a new {@link Coat} instance that is valid for the {@link Shader} referenced by this material
         */
        createCoatMatchingShader(): Coat;
        /**
         * Changes the materials reference to the given {@link Shader}, creates and references a new {@link Coat} instance
         * and mutates the new coat to preserve matching properties.
         * @param _shaderType
         */
        setShader(_shaderType: typeof Shader): void;
        /**
         * Returns the {@link Shader} referenced by this material
         */
        getShader(): typeof Shader;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    interface Border {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }
    /**
     * Framing describes how to map a rectangle into a given frame
     * and how points in the frame correspond to points in the resulting rectangle and vice versa
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Framing
     */
    abstract class Framing extends Mutable {
        /**
         * Maps a point in the given frame according to this framing
         * @param _pointInFrame The point in the frame given
         * @param _rectFrame The frame the point is relative to
         */
        abstract getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2;
        /**
         * Maps a point in a given rectangle back to a calculated frame of origin
         * @param _point The point in the rectangle
         * @param _rect The rectangle the point is relative to
         */
        abstract getPointInverse(_point: Vector2, _rect: Rectangle): Vector2;
        /**
         * Takes a rectangle as the frame and creates a new rectangle according to the framing
         * @param _rectFrame
         */
        abstract getRect(_rectFrame: Rectangle): Rectangle;
        protected reduceMutator(_mutator: Mutator): void;
    }
    /**
     * The resulting rectangle has a fixed width and height and display should scale to fit the frame
     * Points are scaled in the same ratio
     */
    class FramingFixed extends Framing {
        width: number;
        height: number;
        constructor(_width?: number, _height?: number);
        setSize(_width: number, _height: number): void;
        getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2;
        getPointInverse(_point: Vector2, _rect: Rectangle): Vector2;
        getRect(_rectFrame: Rectangle): Rectangle;
    }
    /**
     * Width and height of the resulting rectangle are fractions of those of the frame, scaled by normed values normWidth and normHeight.
     * Display should scale to fit the frame and points are scaled in the same ratio
     */
    class FramingScaled extends Framing {
        normWidth: number;
        normHeight: number;
        setScale(_normWidth: number, _normHeight: number): void;
        getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2;
        getPointInverse(_point: Vector2, _rect: Rectangle): Vector2;
        getRect(_rectFrame: Rectangle): Rectangle;
    }
    /**
     * The resulting rectangle fits into a margin given as fractions of the size of the frame given by normAnchor
     * plus an absolute padding given by pixelBorder. Display should fit into this.
     */
    class FramingComplex extends Framing {
        margin: Border;
        padding: Border;
        getPoint(_pointInFrame: Vector2, _rectFrame: Rectangle): Vector2;
        getPointInverse(_point: Vector2, _rect: Rectangle): Vector2;
        getRect(_rectFrame: Rectangle): Rectangle;
        getMutator(): Mutator;
    }
}
declare namespace FudgeCore {
    /**
     * Representation of a vector2 as polar coordinates
     * ```plaintext
     *  ↕- angle (Angle to the x-axis)
     *  -→ Magnitude (Distance from the center)
     * ```
     */
    class Geo2 implements Recycable {
        magnitude: number;
        angle: number;
        constructor(_angle?: number, _magnitude?: number);
        /**
         * Set the properties of this instance at once
         */
        set(_angle?: number, _magnitude?: number): void;
        recycle(): void;
        /**
         * Returns a pretty string representation
         */
        toString(): string;
    }
}
declare namespace FudgeCore {
    /**
     * Representation of a vector3 as geographic coordinates as seen on a globe
     * ```plaintext
     * ←|→ Longitude (Angle to the z-axis)
     *  ↕- Latitude (Angle to the equator)
     *  -→ Magnitude (Distance from the center)
     * ```
     */
    class Geo3 implements Recycable {
        magnitude: number;
        latitude: number;
        longitude: number;
        constructor(_longitude?: number, _latitude?: number, _magnitude?: number);
        /**
         * Set the properties of this instance at once
         */
        set(_longitude?: number, _latitude?: number, _magnitude?: number): void;
        recycle(): void;
        /**
         * Returns a pretty string representation
         */
        toString(): string;
    }
}
declare namespace FudgeCore {
    function Mash(): Function;
    function LFIB4(): Function;
}
declare namespace FudgeCore {
    /**
     * Simple class for 3x3 matrix operations
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Matrix3x3 extends Mutable implements Serializable, Recycable {
        private static deg2rad;
        private data;
        private mutator;
        private vectors;
        constructor();
        static PROJECTION(_width: number, _height: number): Matrix3x3;
        static IDENTITY(): Matrix3x3;
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given {@link Vector2}.
         */
        static TRANSLATION(_translate: Vector2): Matrix3x3;
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION(_angleInDegrees: number): Matrix3x3;
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given {@link Vector2}
         */
        static SCALING(_scalar: Vector2): Matrix3x3;
        static MULTIPLICATION(_mtxLeft: Matrix3x3, _mtxRight: Matrix3x3): Matrix3x3;
        /**
         * - get: return a vector representation of the translation {@link Vector2}.
         * **Caution!** Use immediately, since the vector is going to be reused by Recycler. Create a clone to keep longer and manipulate.
         * - set: effect the matrix ignoring its rotation and scaling
         */
        get translation(): Vector2;
        set translation(_translation: Vector2);
        /**
         * - get: a copy of the calculated rotation {@link Vector2}
         * - set: effect the matrix
         */
        get rotation(): number;
        set rotation(_rotation: number);
        /**
         * - get: return a vector representation of the scale {@link Vector3}.
         * **Caution!** Do not manipulate result, instead create a clone!
         * - set: effect the matrix
         */
        get scaling(): Vector2;
        set scaling(_scaling: Vector2);
        /**
         * Return a copy of this
         */
        get clone(): Matrix3x3;
        /**
         * Resets the matrix to the identity-matrix and clears cache. Used by the recycler to reset.
         */
        recycle(): void;
        /**
         * Resets the matrix to the identity-matrix and clears cache.
         */
        reset(): void;
        /**
         * Add a translation by the given {@link Vector2} to this matrix
         */
        translate(_by: Vector2): void;
        /**
         * Add a translation along the x-Axis by the given amount to this matrix
         */
        translateX(_x: number): void;
        /**
         * Add a translation along the y-Axis by the given amount to this matrix
         */
        translateY(_y: number): void;
        /**
         * Add a scaling by the given {@link Vector2} to this matrix
         */
        scale(_by: Vector2): void;
        /**
         * Add a scaling along the x-Axis by the given amount to this matrix
         */
        scaleX(_by: number): void;
        /**
         * Add a scaling along the y-Axis by the given amount to this matrix
         */
        scaleY(_by: number): void;
        /**
         * Adds a rotation around the z-Axis to this matrix
         */
        rotate(_angleInDegrees: number): void;
        /**
         * Multiply this matrix with the given matrix
         */
        multiply(_mtxRight: Matrix3x3): void;
        /**
         * Calculates and returns the euler-angles representing the current rotation of this matrix
         */
        getEulerAngle(): number;
        /**
         * Sets the elements of this matrix to the values of the given matrix
         */
        set(_mtxTo: Matrix3x3): void;
        toString(): string;
        /**
         * Return the elements of this matrix as a Float32Array
         */
        get(): Float32Array;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        mutate(_mutator: Mutator): Promise<void>;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        protected reduceMutator(_mutator: Mutator): void;
        private resetCache;
    }
}
declare namespace FudgeCore {
    /**
     * Represents the matrix as translation, rotation and scaling {@link Vector3}, being calculated from the matrix
     */
    interface VectorRepresentation {
        translation: Vector3;
        rotation: Vector3;
        scaling: Vector3;
    }
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
    export class Matrix4x4 extends Mutable implements Serializable, Recycable {
        #private;
        private static deg2rad;
        private data;
        private mutator;
        private vectors;
        constructor();
        /**
         * Retrieve a new identity matrix
         */
        static IDENTITY(): Matrix4x4;
        /**
         * Constructs a new matrix according to the translation, rotation and scaling {@link Vector3}s given
         */
        static CONSTRUCTION(_vectors: VectorRepresentation): Matrix4x4;
        /**
         * Computes and returns the product of two passed matrices.
         * @param _mtxLeft The matrix to multiply.
         * @param _mtxRight The matrix to multiply by.
         */
        static MULTIPLICATION(_mtxLeft: Matrix4x4, _mtxRight: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns the transpose of a passed matrix.
         */
        static TRANSPOSE(_mtx: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _mtx The matrix to compute the inverse of.
         */
        static INVERSION(_mtx: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns a matrix with the given translation, its z-axis pointing directly at the given target,
         * and a minimal angle between its y-axis and the given up-{@link Vector3}, respetively calculating yaw and pitch.
         * The pitch may be restricted to the up-vector to only calculate yaw.
         */
        static LOOK_AT(_translation: Vector3, _target: Vector3, _up?: Vector3, _restrict?: boolean): Matrix4x4;
        /**
         * Computes and returns a matrix with the given translation, its y-axis matching the given up-{@link Vector3}
         * and its z-axis facing towards the given target at a minimal angle, respetively calculating yaw only.
         */
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given {@link Vector3}.
         */
        static TRANSLATION(_translate: Vector3): Matrix4x4;
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         */
        static ROTATION_X(_angleInDegrees: number): Matrix4x4;
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         */
        static ROTATION_Y(_angleInDegrees: number): Matrix4x4;
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         */
        static ROTATION_Z(_angleInDegrees: number): Matrix4x4;
        /**
         * Returns a matrix that rotates coordinates when multiplied by, using the angles given.
         * Rotation occurs around the axis in the order Z-Y-X .
         */
        static ROTATION(_eulerAnglesInDegrees: Vector3): Matrix4x4;
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given {@link Vector3}
         */
        static SCALING(_scalar: Vector3): Matrix4x4;
        /**
         * Returns a representation of the given matrix relative to the given base.
         * If known, pass the inverse of the base to avoid unneccesary calculation
         */
        static RELATIVE(_mtx: Matrix4x4, _mtxBase: Matrix4x4, _mtxInverse?: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace border on the z-axis.
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        static PROJECTION_CENTRAL(_aspect: number, _fieldOfViewInDegrees: number, _near: number, _far: number, _direction: FIELD_OF_VIEW): Matrix4x4;
        /**
         * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         * @param _near The positionvalue of the projectionspace's near border.
         * @param _far The positionvalue of the projectionspace's far border
         */
        static PROJECTION_ORTHOGRAPHIC(_left: number, _right: number, _bottom: number, _top: number, _near?: number, _far?: number): Matrix4x4;
        /**
         * - get: return a vector representation of the translation {@link Vector3}.
         * **Caution!** Use immediately and readonly, since the vector is going to be reused by Recycler. Create a clone to keep longer and manipulate.
         * - set: effect the matrix ignoring its rotation and scaling
         */
        set translation(_translation: Vector3);
        get translation(): Vector3;
        /**
         * - get: return a vector representation of the rotation {@link Vector3}.
         * **Caution!** Use immediately and readonly, since the vector is going to be reused by Recycler. Create a clone to keep longer and manipulate.
         * - set: effect the matrix
         */
        get rotation(): Vector3;
        set rotation(_rotation: Vector3);
        /**
         * - get: return a vector representation of the scaling {@link Vector3}.
         * **Caution!** Use immediately and readonly, since the vector is going to be reused by Recycler. Create a clone to keep longer and manipulate.
         * - set: effect the matrix
         */
        get scaling(): Vector3;
        set scaling(_scaling: Vector3);
        /**
         * Return a copy of this
         */
        get clone(): Matrix4x4;
        /**
         * Resets the matrix to the identity-matrix and clears cache. Used by the recycler to reset.
         */
        recycle(): void;
        /**
         * Resets the matrix to the identity-matrix and clears cache.
         */
        reset(): void;
        /**
         * Rotate this matrix by given {@link Vector3} in the order Z, Y, X. Right hand rotation is used, thumb points in axis direction, fingers curling indicate rotation
         * The rotation is appended to already applied transforms, thus multiplied from the right. Set _fromLeft to true to switch and put it in front.
         */
        rotate(_by: Vector3, _fromLeft?: boolean): void;
        transpose(): Matrix4x4;
        inverse(): Matrix4x4;
        /**
         * Adds a rotation around the x-axis to this matrix
         */
        rotateX(_angleInDegrees: number, _fromLeft?: boolean): void;
        /**
         * Adds a rotation around the y-axis to this matrix
         */
        rotateY(_angleInDegrees: number, _fromLeft?: boolean): void;
        /**
         * Adds a rotation around the z-axis to this matrix
         */
        rotateZ(_angleInDegrees: number, _fromLeft?: boolean): void;
        /**
         * Adjusts the rotation of this matrix to point the z-axis directly at the given target and tilts it to accord with the given up-{@link Vector3},
         * respectively calculating yaw and pitch. If no up-{@link Vector3} is given, the previous up-{@link Vector3} is used.
         * The pitch may be restricted to the up-vector to only calculate yaw.
         */
        lookAt(_target: Vector3, _up?: Vector3, _restrict?: boolean): void;
        /**
         * Same as {@link Matrix4x4.lookAt}, but optimized and needs testing
         */
        /**
         * Add a translation by the given {@link Vector3} to this matrix.
         * If _local is true, translation occurs according to the current rotation and scaling of this matrix,
         * according to the parent otherwise.
         */
        translate(_by: Vector3, _local?: boolean): void;
        /**
         * Add a translation along the x-axis by the given amount to this matrix
         */
        translateX(_x: number, _local?: boolean): void;
        /**
         * Add a translation along the y-axis by the given amount to this matrix
         */
        translateY(_y: number, _local?: boolean): void;
        /**
         * Add a translation along the z-axis by the given amount to this matrix
         */
        translateZ(_z: number, _local?: boolean): void;
        /**
         * Add a scaling by the given {@link Vector3} to this matrix
         */
        scale(_by: Vector3): void;
        /**
         * Add a scaling along the x-axis by the given amount to this matrix
         */
        scaleX(_by: number): void;
        /**
         * Add a scaling along the y-axis by the given amount to this matrix
         */
        scaleY(_by: number): void;
        /**
         * Add a scaling along the z-axis by the given amount to this matrix
         */
        scaleZ(_by: number): void;
        /**
         * Multiply this matrix with the given matrix
         */
        multiply(_matrix: Matrix4x4, _fromLeft?: boolean): void;
        /**
         * Calculates and returns the euler-angles representing the current rotation of this matrix.
         */
        getEulerAngles(): Vector3;
        /**
         * Sets the elements of this matrix to the values of the given matrix
         */
        set(_mtxTo: Matrix4x4 | Float32Array): void;
        toString(): string;
        /**
         * Return the elements of this matrix as a Float32Array
         */
        get(): Float32Array;
        /**
         * Return cardinal x-axis
         */
        getX(): Vector3;
        /**
         * Return cardinal y-axis
         */
        getY(): Vector3;
        /**
         * Return cardinal z-axis
         */
        getZ(): Vector3;
        /**
         * Swaps the two cardinal axis and reverses the third, effectively rotating the transform 180 degrees around one and 90 degrees around a second axis
         */
        swapXY(): void;
        /**
         * Swaps the two cardinal axis and reverses the third, effectively rotating the transform 180 degrees around one and 90 degrees around a second axis
         */
        swapXZ(): void;
        /**
         * Swaps the two cardinal axis and reverses the third, effectively rotating the transform 180 degrees around one and 90 degrees around a second axis
         */
        swapYZ(): void;
        /**
         * Returns the tranlation from this matrix to the target matrix
         */
        getTranslationTo(_mtxTarget: Matrix4x4): Vector3;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        mutate(_mutator: Mutator): Promise<void>;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        protected reduceMutator(_mutator: Mutator): void;
        private resetCache;
    }
    export {};
}
/**
 * Baseclass for Noise2, Noise3 and Noise4
 * @authors Jirka Dell'Oro-Friedl, HFU, 2021
 * This is an adaption of https://www.npmjs.com/package/fast-simplex-noise
 */
declare namespace FudgeCore {
    class Noise {
        protected perm: Uint8Array;
        protected permMod12: Uint8Array;
        constructor(_random?: Function);
    }
}
/**
 * This is an adaption of https://www.npmjs.com/package/fast-simplex-noise
 * done by Jirka Dell'Oro-Friedl, HFU, 2021
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */
declare namespace FudgeCore {
    class Noise2 extends Noise {
        #private;
        private static offset;
        private static gradient;
        constructor(_random?: Function);
        sample: (_x: number, _y: number) => number;
    }
}
/**
 * This is an adaption of https://www.npmjs.com/package/fast-simplex-noise
 * done by Jirka Dell'Oro-Friedl, HFU, 2021
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */
declare namespace FudgeCore {
    class Noise3 extends Noise {
        #private;
        private static offset;
        private static gradient;
        constructor(_random?: Function);
        sample: (_x: number, _y: number, _z: number) => number;
    }
}
/**
 * This is an adaption of https://www.npmjs.com/package/fast-simplex-noise
 * done by Jirka Dell'Oro-Friedl, HFU, 2021
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */
declare namespace FudgeCore {
    class Noise4 extends Noise {
        #private;
        private static offset;
        private static gradient;
        constructor(_random?: Function);
        sample: (_x: number, _y: number, _z: number, _w: number) => number;
    }
}
declare namespace FudgeCore {
    /**
     * Class for creating random values, supporting Javascript's Math.random and a deterministig pseudo-random number generator (PRNG)
     * that can be fed with a seed and then returns a reproducable set of random numbers (if the precision of Javascript allows)
     *
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Random {
        static default: Random;
        private generate;
        /**
         * Create an instance of {@link Random}.
         * If a seed is given, LFIB4 is used as generator, reproducing a series of numbers from that seed.
         * If a function producing values between 0 and 1 is given, it will be used as generator.
         */
        constructor(_seedOrFunction?: number | Function);
        /**
         * Returns a normed random number, thus in the range of [0, 1[
         */
        getNorm(): number;
        /**
         * Returns a random number in the range of given [_min, _max[
         */
        getRange(_min: number, _max: number): number;
        /**
         * Returns a random integer number in the range of given floored [_min, _max[
         */
        getRangeFloored(_min: number, _max: number): number;
        /**
         * Returns true or false randomly
         */
        getBoolean(): boolean;
        /**
         * Returns -1 or 1 randomly
         */
        getSign(): number;
        /**
         * Returns a randomly selected index into the given array
         */
        getIndex<T>(_array: Array<T>): number;
        /**
         * Returns a randomly selected element of the given array
         */
        getElement<T>(_array: Array<T>): T;
        /**
         * Removes a randomly selected element from the given array and returns it
         */
        splice<T>(_array: Array<T>): T;
        /**
         * Returns a randomly selected key from the given Map-instance
         */
        getKey<T, U>(_map: Map<T, U>): T;
        /**
         * Returns a randomly selected property name from the given object
         */
        getPropertyName(_object: Object): string;
        /**
         * Returns a randomly selected symbol from the given object, if symbols are used as keys
         */
        getPropertySymbol(_object: Object): symbol;
        /**
         * Returns a random three-dimensional vector in the limits of the box defined by the vectors given as [_corner0, _corner1[
         */
        getVector3(_corner0: Vector3, _corner1: Vector3): Vector3;
        /**
         * Returns a random two-dimensional vector in the limits of the rectangle defined by the vectors given as [_corner0, _corner1[
         */
        getVector2(_corner0: Vector2, _corner1: Vector2): Vector2;
    }
    /**
     * Standard {@link Random}-instance using Math.random().
     */
    const random: Random;
}
declare namespace FudgeCore {
    /**
     * Stores and manipulates a threedimensional vector comprised of the components x, y and z
     * ```plaintext
     *            +y
     *             |__ +x
     *            /
     *          +z
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019-2022
     */
    class Vector3 extends Mutable implements Recycable {
        private data;
        constructor(_x?: number, _y?: number, _z?: number);
        /**
         * Creates and returns a vector with the given length pointing in x-direction
         */
        static X(_scale?: number): Vector3;
        /**
         * Creates and returns a vector with the given length pointing in y-direction
         */
        static Y(_scale?: number): Vector3;
        /**
         * Creates and returns a vector with the given length pointing in z-direction
         */
        static Z(_scale?: number): Vector3;
        /**
         * Creates and returns a vector with the value 0 on each axis
         */
        static ZERO(): Vector3;
        /**
         * Creates and returns a vector of the given size on each of the three axis
         */
        static ONE(_scale?: number): Vector3;
        /**
         * Creates and returns a vector through transformation of the given vector by the given matrix
         */
        static TRANSFORMATION(_vector: Vector3, _mtxTransform: Matrix4x4, _includeTranslation?: boolean): Vector3;
        /**
         * Creates and returns a vector which is a copy of the given vector scaled to the given length
         */
        static NORMALIZATION(_vector: Vector3, _length?: number): Vector3;
        /**
         * Returns the resulting vector attained by addition of all given vectors.
         */
        static SUM(..._vectors: Vector3[]): Vector3;
        /**
         * Returns the result of the subtraction of two vectors.
         */
        static DIFFERENCE(_minuend: Vector3, _subtrahend: Vector3): Vector3;
        /**
         * Returns a new vector representing the given vector scaled by the given scaling factor
         */
        static SCALE(_vector: Vector3, _scaling: number): Vector3;
        /**
         * Computes the crossproduct of 2 vectors.
         */
        static CROSS(_a: Vector3, _b: Vector3): Vector3;
        /**
         * Computes the dotproduct of 2 vectors.
         */
        static DOT(_a: Vector3, _b: Vector3): number;
        /**
         * Calculates and returns the reflection of the incoming vector at the given normal vector. The length of normal should be 1.
         *     __________________
         *           /|\
         * incoming / | \ reflection
         *         /  |  \
         *          normal
         *
         */
        static REFLECTION(_incoming: Vector3, _normal: Vector3): Vector3;
        /**
         * Divides the dividend by the divisor component by component and returns the result
         */
        static RATIO(_dividend: Vector3, _divisor: Vector3): Vector3;
        /**
         * Creates a cartesian vector from geographic coordinates
         */
        static GEO(_longitude?: number, _latitude?: number, _magnitude?: number): Vector3;
        get x(): number;
        get y(): number;
        get z(): number;
        set x(_x: number);
        set y(_y: number);
        set z(_z: number);
        /**
         * Returns the length of the vector
         */
        get magnitude(): number;
        /**
         * Returns the square of the magnitude of the vector without calculating a square root. Faster for simple proximity evaluation.
         */
        get magnitudeSquared(): number;
        /**
         * Returns a copy of this vector
         * TODO: rename this clone and create a new method copy, which copies the values from a vector given
         */
        get clone(): Vector3;
        /**
         * - get: returns a geographic representation of this vector
         * - set: adjust the cartesian values of this vector to represent the given as geographic coordinates
         */
        set geo(_geo: Geo3);
        get geo(): Geo3;
        recycle(): void;
        /**
         * Returns true if the coordinates of this and the given vector are to be considered identical within the given tolerance
         * TODO: examine, if tolerance as criterium for the difference is appropriate with very large coordinate values or if _tolerance should be multiplied by coordinate value
         */
        equals(_compare: Vector3, _tolerance?: number): boolean;
        /**
         * Returns true if the position described by this is within a cube with the opposite corners 1 and 2
         */
        isInsideCube(_corner1: Vector3, _corner2: Vector3): boolean;
        /**
         * Returns true if the position described by this is within a sphere with the given center and radius
         */
        isInsideSphere(_center: Vector3, _radius: number): boolean;
        /**
         * Adds the given vector to this
         */
        add(_addend: Vector3): void;
        /**
         * Subtracts the given vector from this
         */
        subtract(_subtrahend: Vector3): void;
        /**
         * Scales this vector by the given scalar
         */
        scale(_scalar: number): void;
        /**
         * Normalizes this to the given length, 1 by default
         */
        normalize(_length?: number): void;
        /**
         * Defines the components of this vector with the given numbers
         */
        set(_x?: number, _y?: number, _z?: number): void;
        /**
         * Returns this vector as a new Float32Array (copy)
         */
        get(): Float32Array;
        /**
         * Transforms this vector by the given matrix, including or exluding the translation.
         * Including is the default, excluding will only rotate and scale this vector.
         */
        transform(_mtxTransform: Matrix4x4, _includeTranslation?: boolean): void;
        /**
         * Drops the z-component and returns a Vector2 consisting of the x- and y-components
         */
        toVector2(): Vector2;
        /**
         * Reflects this vector at a given normal. See {@link Vector3.REFLECTION}
         */
        reflect(_normal: Vector3): void;
        /**
         * Shuffles the components of this vector
         */
        shuffle(): void;
        getDistance(_to: Vector3): number;
        /**
         * For each dimension, moves the component to the minimum of this and the given vector
         */
        min(_compare: Vector3): void;
        /**
         * For each dimension, moves the component to the maximum of this and the given vector
         */
        max(_compare: Vector3): void;
        /**
         * Returns a formatted string representation of this vector
         */
        toString(): string;
        /**
         * Uses the standard array.map functionality to perform the given function on all components of this vector
         */
        map(_function: (value: number, index: number, array: Float32Array) => number): Vector3;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Vector3>;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Describes a face of a {@link Mesh} by referencing three {@link Vertices} with their indizes
     * and calculates face normals.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2022
     */
    class Face {
        indices: number[];
        normalUnscaled: Vector3;
        normal: Vector3;
        private vertices;
        constructor(_vertices: Vertices, _index0: number, _index1: number, _index2: number);
        calculateNormals(): void;
        getPosition(_index: number): Vector3;
        /**
         * must be coplanar
         */
        isInside(_point: Vector3): boolean;
    }
}
declare namespace FudgeCore {
    /**
     * Abstract base class for all meshes.
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019/22
     */
    abstract class Mesh extends Mutable implements SerializableResource {
        /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
        static readonly baseClass: typeof Mesh;
        /** list of all the subclasses derived from this class, if they registered properly*/
        static readonly subclasses: typeof Mesh[];
        idResource: string;
        name: string;
        vertices: Vertices;
        faces: Face[];
        protected renderMesh: RenderMesh;
        /** bounding box AABB */
        protected ƒbox: Box;
        /** bounding radius */
        protected ƒradius: number;
        constructor(_name?: string);
        protected static registerSubclass(_subClass: typeof Mesh): number;
        get type(): string;
        get boundingBox(): Box;
        get radius(): number;
        useRenderBuffers(_shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number): RenderBuffers;
        getRenderBuffers(_shader: typeof Shader): RenderBuffers;
        deleteRenderBuffers(_shader: typeof Shader): void;
        clear(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
        protected createRadius(): number;
        protected createBoundingBox(): Box;
    }
}
declare namespace FudgeCore {
    /**
     * Generate a simple cube with edges of length 1, each face consisting of two trigons
     * ```plaintext
     *       (12) 4____7  (11)
     *       (8) 0/__3/| (10)
     *       (15) ||5_||6 (14)
     *       (9) 1|/_2|/ (13)
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshCube extends Mesh {
        static readonly iSubclass: number;
        constructor(_name?: string);
    }
}
declare namespace FudgeCore {
    /**
     * Generate a flat polygon. All trigons share vertex 0, so careful design is required to create concave polygons.
     * Vertex 0 is also associated with the face normal.
     * ```plaintext
     *             0
     *           1╱|╲  4 ...
     *            ╲|_╲╱
     *            2   3
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021-2022
     */
    class MeshPolygon extends Mesh {
        static readonly iSubclass: number;
        protected static shapeDefault: Vector2[];
        protected shape: MutableArray<Vector2>;
        protected fitTexture: boolean;
        constructor(_name?: string, _shape?: Vector2[], _fitTexture?: boolean);
        protected get minVertices(): number;
        create(_shape?: Vector2[], _fitTexture?: boolean): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Generates an extrusion of a polygon by a series of transformations
     * ```plaintext
     *                      ____
     * Polygon         ____╱╲   ╲                             y
     * Transform 0  → ╱ ╲__╲_╲___╲ ← Transform 2          z __│
     * (base)         ╲_╱__╱ ╱   ╱   (lid)                     ╲
     *     Transform 1  →  ╲╱___╱                               x
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021-2022
     */
    class MeshExtrusion extends MeshPolygon {
        static readonly iSubclass: number;
        protected static mtxDefaults: Matrix4x4[];
        private mtxTransforms;
        constructor(_name?: string, _vertices?: Vector2[], _mtxTransforms?: Matrix4x4[], _fitTexture?: boolean);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
        private extrude;
    }
}
declare namespace FudgeCore {
    /** Allows to create custom meshes from given Data */
    class MeshFromData extends Mesh {
        protected verticesToSet: Float32Array;
        protected textureUVsToSet: Float32Array;
        protected indicesToSet: Uint16Array;
        protected faceNormalsToSet: Float32Array;
        constructor(_vertices: Float32Array, _textureUVs: Float32Array, _indices: Uint16Array, _faceNormals: Float32Array);
        protected createVertices(): Float32Array;
        protected createTextureUVs(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createFlatNormals(): Float32Array;
    }
}
declare namespace FudgeCore {
    /**
     * Mesh loaded from a GLTF-file
     * @author Matthias Roming, HFU, 2022
     */
    class MeshGLTF extends Mesh {
        private uriGLTF;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        load(_loader: GLTFLoader, _iMesh: number): Promise<MeshGLTF>;
    }
}
declare namespace FudgeCore {
    class MeshObj extends Mesh {
        static readonly iSubclass: number;
        url: RequestInfo;
        constructor(_name?: string, _url?: RequestInfo);
        /**
             * Asynchronously loads the image from the given url
             */
        load(_url: RequestInfo): Promise<void>;
        /** Splits up the obj string into separate arrays for each datatype */
        parseObj(data: string): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
    }
}
declare namespace FudgeCore {
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
    class MeshPyramid extends Mesh {
        static readonly iSubclass: number;
        constructor(_name?: string);
    }
}
declare namespace FudgeCore {
    /**
     * Generate a simple quad with edges of length 1, the face consisting of two trigons
     * ```plaintext
     *        0 __ 3
     *         |_\|
     *        1    2
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019-2022
     */
    class MeshQuad extends MeshPolygon {
        static readonly iSubclass: number;
        protected static shape: Vector2[];
        constructor(_name?: string);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * This function type takes x and z as Parameters and returns a number between -1 and 1 to be used as a heightmap.
     * x * z * 2 represent the amout of faces which are created. As a result you get 1 vertex more in each direction (x and z axis)
     * The y-component of the resulting mesh may be moved to values between 0 and a maximum height.
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021-2022
     */
    type HeightMapFunction = (x: number, z: number) => number;
    /**
     * Information about the vertical projection of a given position onto the terrain
     */
    class TerrainInfo {
        /** the position of the point vertically projected on the terrain in world coordinates */
        position: Vector3;
        /** the normal of the face of the terrain under the point in world coordinates */
        normal: Vector3;
        /** vertical distance of the point to the terrain, negative if below */
        distance: number;
        /** the position in face coordinates */
        positionFace: Vector3;
        /** the index of the face the position is inside */
        index: number;
    }
    /**
     * A terrain spreads out in the x-z-plane, y is the height derived from the heightmap function.
     * The terrain is always 1 in size in all dimensions, fitting into the unit-cube.
     * Resolution determines the number of quads in x and z dimension, scale the factor applied to the x,z-coordinates passed to the heightmap function.
     * Standard function is the simplex noise implemented with FUDGE, but another function can be given.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021-2022 | Simon Storl-Schulke, HFU, 2020 | Moritz Beaugrand, HFU, 2021
     */
    class MeshTerrain extends Mesh {
        static readonly iSubclass: number;
        protected resolution: Vector2;
        protected scale: Vector2;
        protected seed: number;
        protected heightMapFunction: HeightMapFunction;
        constructor(_name?: string, _resolution?: Vector2, _scaleInput?: Vector2, _functionOrSeed?: HeightMapFunction | number);
        create(_resolution?: Vector2, _scaleInput?: Vector2, _functionOrSeed?: HeightMapFunction | number): void;
        /**
         * Returns information about the vertical projection of the given position onto the terrain.
         * Pass the overall world transformation of the terrain if the position is given in world coordinates.
         * If at hand, pass the inverse too to avoid unnecessary calculation.
         */
        getTerrainInfo(_position: Vector3, _mtxWorld?: Matrix4x4, _mtxInverse?: Matrix4x4): TerrainInfo;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
    }
}
declare namespace FudgeCore {
    /**
     * Generates a planar Grid and applies a Heightmap-Function to it.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Moritz Beaugrand, HFU, 2020
     */
    class MeshRelief extends MeshTerrain {
        static readonly iSubclass: number;
        private texture;
        constructor(_name?: string, _texture?: TextureImage);
        private static createHeightMapFunction;
        private static textureToClampedArray;
        setTexture(_texture?: TextureImage): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Generates a rotation of a polygon around the y-axis
     * ```plaintext
     *                     y
     *                  _  ↑ 0_1
     *                 │   │→x │2
     *                  ╲  │  ╱3
     *                  ╱  │  ╲
     *                 ╱___│___╲4
     *                      5
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021-2022
     */
    class MeshRotation extends Mesh {
        static readonly iSubclass: number;
        protected static verticesDefault: Vector2[];
        protected shape: MutableArray<Vector2>;
        protected longitudes: number;
        constructor(_name?: string, _shape?: Vector2[], _longitudes?: number);
        protected get minVertices(): number;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected rotate(_shape: Vector2[], _longitudes: number): void;
    }
}
declare namespace FudgeCore {
    class RenderInjectorMeshSkin extends RenderInjectorMesh {
        static decorate(_constructor: Function): void;
        protected static getRenderBuffers(this: MeshSkin, _shader: typeof Shader): RenderBuffers;
        protected static useRenderBuffers(this: MeshSkin, _shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers;
        protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void;
    }
}
declare namespace FudgeCore {
    /**
     * Mesh influenced by a skeleton
     * @author Matthias Roming, HFU, 2022
     */
    class MeshSkin extends MeshGLTF {
        load(_loader: GLTFLoader, _iMesh: number): Promise<MeshSkin>;
        useRenderBuffers(_shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Generate a UV Sphere with a given number of sectors and stacks (clamped at 128*128)
     * Implementation based on http://www.songho.ca/opengl/gl_sphere.html
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshSphere extends MeshRotation {
        static readonly iSubclass: number;
        private latitudes;
        constructor(_name?: string, _longitudes?: number, _latitudes?: number);
        create(_longitudes?: number, _latitudes?: number): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Generate two quads placed back to back, the one facing in negative Z-direction is textured reversed
     * ```plaintext
     *        0 __ 3
     *         |__|
     *        1    2
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshSprite extends Mesh {
        static readonly iSubclass: number;
        constructor(_name?: string);
        get verticesFlat(): Float32Array;
        get indicesFlat(): Uint16Array;
    }
}
declare namespace FudgeCore {
    /**
     * Generate a Torus with a given thickness and the number of major- and minor segments
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshTorus extends MeshRotation {
        static readonly iSubclass: number;
        private size;
        private latitudes;
        constructor(_name?: string, _size?: number, _longitudes?: number, _latitudes?: number);
        private static getShape;
        create(_size?: number, _longitudes?: number, _latitudes?: number): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    enum QUADSPLIT {
        PLANAR = 0,
        AT_0 = 1,
        AT_1 = 2
    }
    /**
     * A surface created with four vertices which immediately creates none, one or two {@link Face}s depending on vertices at identical positions.
     * ```plaintext
     * QUADSPLIT:  PLANAR                  AT_0                     AT_1
     *             0 _ 3                   0 _ 3                    0 _ 3
     *              |\|                     |\|                      |/|
     *             1 ‾ 2                   1 ‾ 2                    1 ‾ 2
     *  shared last vertex 2      last vertices 2 + 3      last vertices 3 + 0
     *
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2022
     */
    class Quad {
        #private;
        faces: Face[];
        constructor(_vertices: Vertices, _index0: number, _index1: number, _index2: number, _index3: number, _split?: QUADSPLIT);
        get split(): QUADSPLIT;
    }
}
declare namespace FudgeCore {
    interface Bone {
        index: number;
        weight: number;
    }
    class Vertex {
        position: Vector3;
        uv: Vector2;
        normal: Vector3;
        referTo: number;
        bones: Bone[];
        /**
         * Represents a vertex of a mesh with extended information such as the uv coordinates and the vertex normal.
         * It may refer to another vertex via an index into some array, in which case the position and the normal are stored there.
         * This way, vertex position and normal is a 1:1 association, vertex to texture coordinates a 1:n association.
       * @authors Jirka Dell'Oro-Friedl, HFU, 2022
         */
        constructor(_positionOrIndex: Vector3 | number, _uv?: Vector2, _normal?: Vector3);
    }
}
declare namespace FudgeCore {
    /**
     * Array with extended functionality to serve as a {@link Vertex}-cloud.
     * Accessors yield position or normal also for vertices referencing other vertices
     * @authors Jirka Dell'Oro-Friedl, HFU, 2022
     */
    class Vertices extends Array<Vertex> {
        /**
         * Returns the subset of vertices that do not refer to other vertices
         */
        get originals(): Array<Vertex>;
        /**
         * returns the position associated with the vertex addressed, resolving references between vertices
         */
        position(_index: number): Vector3;
        /**
         * returns the normal associated with the vertex addressed, resolving references between vertices
         */
        normal(_index: number): Vector3;
        /**
         * returns the uv-coordinates associated with the vertex addressed
         */
        uv(_index: number): Vector2;
        /**
         * returns the position associated with the vertex addressed, resolving references between vertices
         */
        bones(_index: number): Bone[];
    }
}
declare namespace FudgeCore {
    /**
     * Defines automatic adjustment of the collider
     */
    enum BODY_INIT {
        /** Collider uses the pivot of the mesh for initilialization */
        TO_MESH = 0,
        /** Collider uses the transform of the node for initilialization */
        TO_NODE = 1,
        /** Collider uses its own pivot for initilialization */
        TO_PIVOT = 2
    }
    /**
       * Acts as the physical representation of the {@link Node} it's attached to.
       * It's the connection between the Fudge rendered world and the Physics world.
       * For the physics to correctly get the transformations rotations need to be applied with from left = true.
       * Or rotations need to happen before scaling.
       * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
       */
    class ComponentRigidbody extends Component {
        #private;
        static readonly iSubclass: number;
        private static mapBodyType;
        /** Transformation of the collider relative to the node's transform. Once set mostly remains constant.
         * If altered, {@link isInitialized} must be reset to false to recreate the collider in the next {@link Render.prepare}
         */
        mtxPivot: Matrix4x4;
        /**
         * Vertices that build a convex mesh (form that is in itself closed). Needs to set in the construction of the rb if none of the standard colliders is used.
         * Untested and not yet fully supported by serialization and mutation.
         */
        convexMesh: Float32Array;
        /** Collisions with rigidbodies happening to this body, can be used to build a custom onCollisionStay functionality. */
        collisions: ComponentRigidbody[];
        /** Triggers that are currently triggering this body */
        triggerings: ComponentRigidbody[];
        /**
         * The groups this object collides with. Groups must be writen in form of
         *  e.g. collisionMask = {@link COLLISION_GROUP.DEFAULT} | {@link COLLISION_GROUP}.... and so on to collide with multiple groups.
         */
        collisionMask: number;
        /**
         * Automatic adjustment of the pivot when {@link Render.prepare} is called according to {@link BODY_INIT}
         */
        initialization: BODY_INIT;
        /** Marks if collider was initialized. Reset to false to initialize again e.g. after manipulation of mtxPivot */
        isInitialized: boolean;
        /** Creating a new rigidbody with a weight in kg, a physics type (default = dynamic), a collider type what physical form has the collider, to what group does it belong, is there a transform Matrix that should be used, and is the collider defined as a group of points that represent a convex mesh. */
        constructor(_mass?: number, _type?: BODY_TYPE, _colliderType?: COLLIDER_TYPE, _group?: COLLISION_GROUP, _mtxTransform?: Matrix4x4, _convexMesh?: Float32Array);
        get id(): number;
        /** Used for calculation of the geometrical relationship of node and collider by {@link Render}*/
        get mtxPivotInverse(): Matrix4x4;
        /** Used for calculation of the geometrical relationship of node and collider by {@link Render}*/
        get mtxPivotUnscaled(): Matrix4x4;
        /** Retrieve the body type. See {@link BODY_TYPE} */
        get typeBody(): BODY_TYPE;
        /** Set the body type. See {@link BODY_TYPE} */
        set typeBody(_value: BODY_TYPE);
        /** The shape that represents the {@link Node} in the physical world. Default is a Cube. */
        get typeCollider(): COLLIDER_TYPE;
        set typeCollider(_value: COLLIDER_TYPE);
        /** The collision group this {@link Node} belongs to it's the default group normally which means it physically collides with every group besides trigger. */
        get collisionGroup(): COLLISION_GROUP;
        set collisionGroup(_value: COLLISION_GROUP);
        /** Marking the Body as a trigger therefore not influencing the collision system but only sending triggerEvents */
        get isTrigger(): boolean;
        set isTrigger(_value: boolean);
        /**
         * Returns the physical weight of the {@link Node}
         */
        get mass(): number;
        /**
         * Setting the physical weight of the {@link Node} in kg
         */
        set mass(_value: number);
        /** Drag of linear movement. A Body does slow down even on a surface without friction. */
        get dampTranslation(): number;
        set dampTranslation(_value: number);
        /** Drag of rotation. */
        get dampRotation(): number;
        set dampRotation(_value: number);
        /** The factor this rigidbody reacts rotations that happen in the physical world. 0 to lock rotation this axis. */
        get effectRotation(): Vector3;
        set effectRotation(_effect: Vector3);
        /** The factor this rigidbody reacts to world gravity. Default = 1 e.g. 1*9.81 m/s. */
        get effectGravity(): number;
        set effectGravity(_effect: number);
        /**
         * Get the friction of the rigidbody, which is the factor of sliding resistance of this rigidbody on surfaces
         */
        get friction(): number;
        /**
         * Set the friction of the rigidbody, which is the factor of  sliding resistance of this rigidbody on surfaces
         */
        set friction(_friction: number);
        /**
         * Get the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
         */
        get restitution(): number;
        /**
         * Set the restitution of the rigidbody, which is the factor of bounciness of this rigidbody on surfaces
         */
        set restitution(_restitution: number);
        hndEvent: (_event: Event) => void;
        /**
         * Returns the rigidbody in the form the physics engine is using it, should not be used unless a functionality
         * is not provided through the FUDGE Integration.
         */
        getOimoRigidbody(): OIMO.RigidBody;
        /** Rotating the rigidbody therefore changing it's rotation over time directly in physics. This way physics is changing instead of transform.
         *  But you are able to incremental changing it instead of a direct rotation.  Although it's always prefered to use forces in physics.
         */
        rotateBody(_rotationChange: Vector3): void;
        /** Translating the rigidbody therefore changing it's place over time directly in physics. This way physics is changing instead of transform.
         *  But you are able to incrementally changing it instead of a direct position. Although it's always prefered to use forces in physics.
         */
        translateBody(_translationChange: Vector3): void;
        /**
         * Get the current POSITION of the {@link Node} in the physical space
         */
        getPosition(): Vector3;
        /**
         * Sets the current POSITION of the {@link Node} in the physical space
         */
        setPosition(_value: Vector3): void;
        /**
         * Get the current ROTATION of the {@link Node} in the physical space. Note this range from -pi to pi, so -90 to 90.
         */
        getRotation(): Vector3;
        /**
         * Sets the current ROTATION of the {@link Node} in the physical space, in degree.
         */
        setRotation(_value: Vector3): void;
        /** Get the current SCALING in the physical space. */
        getScaling(): Vector3;
        /** Scaling requires the collider to be completely recreated anew */
        setScaling(_value: Vector3): void;
        /**
         * Initializes the rigidbody according to its initialization setting to match the mesh, the node or its own pivot matrix
         */
        initialize(): void;
        /**
        * Get the current VELOCITY of the {@link Node}
        */
        getVelocity(): Vector3;
        /**
         * Sets the current VELOCITY of the {@link Node}
         */
        setVelocity(_value: Vector3): void;
        /**
         * Get the current ANGULAR - VELOCITY of the {@link Node}
         */
        getAngularVelocity(): Vector3;
        /**
         * Sets the current ANGULAR - VELOCITY of the {@link Node}
         */
        setAngularVelocity(_value: Vector3): void;
        /**
        * Applies a continous FORCE at the center of the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS.
        * The force is measured in newton, 1kg needs about 10 Newton to fight against gravity.
        */
        applyForce(_force: Vector3): void;
        /**
        * Applies a continous FORCE at a specific point in the world to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
        */
        applyForceAtPoint(_force: Vector3, _worldPoint: Vector3): void;
        /**
        * Applies a continous ROTATIONAL FORCE (Torque) to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
        */
        applyTorque(_rotationalForce: Vector3): void;
        /**
        * Applies a instant FORCE at a point/rigidbodycenter to the RIGIDBODY in the three dimensions. Considering the rigidbod's MASS
        * Influencing the angular speed and the linear speed.
        */
        applyImpulseAtPoint(_impulse: Vector3, _worldPoint?: Vector3): void;
        /**
        * Applies a instant FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
        * Only influencing it's speed not rotation.
        */
        applyLinearImpulse(_impulse: Vector3): void;
        /**
       * Applies a instant ROTATIONAL-FORCE to the RIGIDBODY in the three dimensions. Considering the rigidbody's MASS
       * Only influencing it's rotation.
       */
        applyAngularImpulse(_rotationalImpulse: Vector3): void;
        /**
       * Changing the VELOCITY of the RIGIDBODY. Only influencing the linear speed not angular
       */
        addVelocity(_value: Vector3): void;
        /**
       * Changing the VELOCITY of the RIGIDBODY. Only influencing the angular speed not the linear
       */
        addAngularVelocity(_value: Vector3): void;
        /** Stops the rigidbody from sleeping when movement is too minimal. Decreasing performance, for rarely more precise physics results */
        deactivateAutoSleep(): void;
        activateAutoSleep(): void;
        /**
         * Checking for Collision with other Colliders and dispatches a custom event with information about the collider.
         * Automatically called in the RenderManager, no interaction needed.
         */
        checkCollisionEvents(): void;
        /**
         * Sends a ray through this specific body ignoring the rest of the world and checks if this body was hit by the ray,
         * returning info about the hit. Provides the same functionality and information a regular raycast does but the ray is only testing against this specific body.
         */
        raycastThisBody(_origin: Vector3, _direction: Vector3, _length: number, _debugDraw?: boolean): RayHitInfo;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        /** Change properties by an associative array */
        mutate(_mutator: Mutator): Promise<void>;
        getMutator(): Mutator;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        reduceMutator(_mutator: Mutator): void;
        private create;
        /** Creates the actual OimoPhysics Rigidbody out of informations the Fudge Component has. */
        private createRigidbody;
        /** Creates a collider a shape that represents the object in the physical world.  */
        private createCollider;
        /** Creating a shape that represents a in itself closed form, out of the given vertices. */
        private createConvexGeometryCollider;
        /** Internal implementation of vertices that construct a pyramid. The vertices of the implemented pyramid mesh can be used too. But they are halfed and double sided, so it's more performant to use this. */
        private createPyramidVertices;
        /** Adding this ComponentRigidbody to the Physiscs.world giving the oimoPhysics system the information needed */
        private addRigidbodyToWorld;
        /** Removing this ComponentRigidbody from the Physiscs.world taking the informations from the oimoPhysics system */
        private removeRigidbodyFromWorld;
        private collisionCenterPoint;
        /**
        * Trigger EnteringEvent Callback, automatically called by OIMO Physics within their calculations.
        * Since the event does not know which body is the trigger iniator, the event can be listened to
        * on either the trigger or the triggered. (This is only possible with the Fudge OIMO Fork!)
        */
        private triggerEnter;
        /**
        * Trigger LeavingEvent Callback, automatically called by OIMO Physics within their calculations.
        * Since the event does not know which body is the trigger iniator, the event can be listened to
        * on either the trigger or the triggered. (This is only possible with the Fudge OIMO Fork!)
        */
        private triggerExit;
    }
}
declare namespace FudgeCore {
    /** Internal class for holding data about physics debug vertices.*/
    class PhysicsDebugVertexBuffer {
        gl: WebGL2RenderingContext;
        numVertices: number;
        attribs: Array<PhysicsDebugVertexAttribute>;
        indices: Array<number>;
        offsets: Array<number>;
        stride: number;
        buffer: WebGLBuffer;
        dataLength: number;
        /** Setup the rendering context for this buffer and create the actual buffer for this context. */
        constructor(_renderingContext: WebGL2RenderingContext);
        /** Fill the bound buffer with data. Used at buffer initialization */
        setData(array: Array<number>): void;
        /** Set Shader Attributes informations by getting their position in the shader, setting the offset, stride and size. For later use in the binding process */
        setAttribs(attribs: Array<PhysicsDebugVertexAttribute>): void;
        /** Get the position of the attribute in the shader */
        loadAttribIndices(_program: PhysicsDebugShader): void;
        /** Enable a attribute in a shader for this context, */
        bindAttribs(): void;
    }
    /** Internal class for holding data about PhysicsDebugVertexBuffers */
    class PhysicsDebugIndexBuffer {
        gl: WebGL2RenderingContext;
        buffer: WebGLBuffer;
        count: number;
        /** Setup the rendering context for this buffer and create the actual buffer for this context. */
        constructor(_renderingContext: WebGL2RenderingContext);
        /** Fill the bound buffer with data amount. Used at buffer initialization */
        setData(array: Array<number>): void;
        /** The actual DrawCall for physicsDebugDraw Buffers. This is where the information from the debug is actually drawn. */
        draw(_mode?: number, _count?: number): void;
    }
    /** Internal class for managing data about webGL Attributes */
    class PhysicsDebugVertexAttribute {
        float32Count: number;
        name: string;
        constructor(_float32Count: number, _name: string);
    }
    /** Internal class for Shaders used only by the physics debugDraw */
    class PhysicsDebugShader {
        gl: WebGL2RenderingContext;
        program: WebGLProgram;
        vertexShader: WebGLShader;
        fragmentShader: WebGLShader;
        uniformLocationMap: Map<string, WebGLUniformLocation>;
        /** Introduce the Fudge Rendering Context to this class, creating a program and vertex/fragment shader in this context */
        constructor(_renderingContext: WebGL2RenderingContext);
        /** Take glsl shaders as strings and compile them, attaching the compiled shaders to a program thats used by this rendering context. */
        compile(vertexSource: string, fragmentSource: string): void;
        /** Get index of a attribute in a shader in this program */
        getAttribIndex(_name: string): number;
        /** Get the location of a uniform in a shader in this program */
        getUniformLocation(_name: string): WebGLUniformLocation;
        /** Get all indices for every attribute in the shaders of this program */
        getAttribIndices(_attribs: Array<PhysicsDebugVertexAttribute>): Array<number>;
        /** Tell the Fudge Rendering Context to use this program to draw. */
        use(): void;
        /** Compile a shader out of a string and validate it. */
        compileShader(shader: WebGLShader, source: string): void;
    }
    /** Internal Class used to draw debugInformations about the physics simulation onto the renderContext. No user interaction needed.
     * @author Marko Fehrenbach, HFU 2020 //Based on OimoPhysics Haxe DebugDrawDemo
     */
    class PhysicsDebugDraw extends RenderWebGL {
        oimoDebugDraw: OIMO.DebugDraw;
        style: OIMO.DebugDrawStyle;
        gl: WebGL2RenderingContext;
        program: WebGLProgram;
        shader: PhysicsDebugShader;
        pointVBO: PhysicsDebugVertexBuffer;
        pointIBO: PhysicsDebugIndexBuffer;
        lineVBO: PhysicsDebugVertexBuffer;
        lineIBO: PhysicsDebugIndexBuffer;
        triVBO: PhysicsDebugVertexBuffer;
        triIBO: PhysicsDebugIndexBuffer;
        pointData: Array<number>;
        pointIboData: Array<number>;
        numPointData: number;
        lineData: Array<number>;
        lineIboData: Array<number>;
        numLineData: number;
        triData: Array<number>;
        triIboData: Array<number>;
        numTriData: number;
        /** Creating the debug for physics in Fudge. Tell it to draw only wireframe objects, since Fudge is handling rendering of the objects besides physics.
         * Override OimoPhysics Functions with own rendering. Initialize buffers and connect them with the context for later use. */
        constructor();
        /** Receive the current DebugMode from the physics settings and set the OimoPhysics.DebugDraw booleans to show only certain informations.
         * Needed since some debug informations exclude others, and can't be drawn at the same time, by OimoPhysics. And for users it provides more readability
         * to debug only what they need and is commonly debugged.
         */
        setDebugMode(_mode?: PHYSICS_DEBUGMODE): void;
        /** Creating the empty render buffers. Defining the attributes used in shaders.
         * Needs to create empty buffers to already have them ready to draw later on, linking is only possible with existing buffers. */
        initializeBuffers(): void;
        /** Before OimoPhysics.world is filling the debug. Make sure the buffers are reset. Also receiving the debugMode from settings and updating the current projection for the vertexShader. */
        clearBuffers(): void;
        /** After OimoPhysics.world filled the debug. Rendering calls. Setting this program to be used by the Fudge rendering context. And draw each updated buffer and resetting them. */
        drawBuffers(): void;
        /** Drawing the ray into the debugDraw Call. By using the overwritten line rendering functions and drawing a point (pointSize defined in the shader) at the end of the ray. */
        debugRay(_origin: Vector3, _end: Vector3, _color: Color): void;
        /** Overriding the existing functions from OimoPhysics.DebugDraw without actually inherit from the class, to avoid compiler problems.
         * Overriding them to receive debugInformations in the format the physic engine provides them but handling the rendering in the fudge context. */
        private initializeOverride;
        /** The source code (string) of the in physicsDebug used very simple vertexShader.
         *  Handling the projection (which includes, view/world[is always identity in this case]/projection in Fudge). Increasing the size of single points drawn.
         *  And transfer position color to the fragmentShader. */
        private vertexShaderSource;
        /** The source code (string) of the in physicsDebug used super simple fragmentShader. Unlit - only colorizing the drawn pixels, normals/position are given to make it expandable */
        private fragmentShaderSource;
    }
}
declare namespace FudgeCore {
    /**
     * A physical connection between two bodies with a defined axe of translation and rotation. Two Degrees of Freedom in the defined axis.
     * Two RigidBodies need to be defined to use it. A motor can be defined for rotation and translation, along with spring settings.
     *
     * ```plaintext
     *          JointHolder - bodyAnchor
     *                    ┌───┐
     *                    │   │
     *           <────────│   │──────> tied body, sliding on axis = 1st degree of freedom
     *                    │   │        rotating around axis = 2nd degree of freedom
     *                    └───┘
     * ```
     * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class JointCylindrical extends JointAxial {
        #private;
        static readonly iSubclass: number;
        protected joint: OIMO.CylindricalJoint;
        protected config: OIMO.CylindricalJointConfig;
        protected motor: OIMO.TranslationalLimitMotor;
        /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _axis?: Vector3, _localAnchor?: Vector3);
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        set springDamping(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        set springFrequency(_value: number);
        /**
        * The damping of the spring. 1 equals completly damped. Influencing TORQUE / ROTATION
        */
        get springDampingRotation(): number;
        set springDampingRotation(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. Influencing TORQUE / ROTATION
        */
        get springFrequencyRotation(): number;
        set springFrequencyRotation(_value: number);
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
         */
        get maxRotor(): number;
        set maxRotor(_value: number);
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get minRotor(): number;
        set minRotor(_value: number);
        /**
          * The target rotational speed of the motor in m/s.
         */
        get rotorSpeed(): number;
        set rotorSpeed(_value: number);
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get rotorTorque(): number;
        set rotorTorque(_value: number);
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        set maxMotor(_value: number);
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
         */
        set minMotor(_value: number);
        set motorSpeed(_value: number);
        /**
          * The maximum motor force in Newton. force <= 0 equals disabled.
         */
        get motorForce(): number;
        set motorForce(_value: number);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        getMutator(): Mutator;
        protected constructJoint(): void;
    }
}
declare namespace FudgeCore {
    /**
       * A physical connection between two bodies with a defined axe movement.
       * Used to create a sliding joint along one axis. Two RigidBodies need to be defined to use it.
       * A motor can be defined to move the connected along the defined axis. Great to construct standard springs or physical sliders.
       *
       * ```plaintext
       *          JointHolder - bodyAnchor
       *                    ┌───┐
       *                    │   │
       *           <────────│   │──────> tied body, sliding on one Axis, 1 Degree of Freedom
       *                    │   │
       *                    └───┘
       * ```
       * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
       */
    class JointPrismatic extends JointAxial {
        #private;
        static readonly iSubclass: number;
        protected joint: OIMO.PrismaticJoint;
        protected config: OIMO.PrismaticJointConfig;
        protected motor: OIMO.TranslationalLimitMotor;
        /** Creating a prismatic joint between two ComponentRigidbodies only moving on one axis bound on a local anchorpoint. */
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _axis?: Vector3, _localAnchor?: Vector3);
        /**
          * The maximum motor force in Newton. force <= 0 equals disabled. This is the force that the motor is using to hold the position, or reach it if a motorSpeed is defined.
         */
        get motorForce(): number;
        set motorForce(_value: number);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        mutate(_mutator: Mutator): Promise<void>;
        /** Actual creation of a joint in the OimoPhysics system */
        protected constructJoint(): void;
    }
}
declare namespace FudgeCore {
    /**
      * A physical connection between two bodies, designed to simulate behaviour within a real body. It has two axis, a swing and twist axis, and also the perpendicular axis,
      * similar to a Spherical joint, but more restrictive in it's angles and only two degrees of freedom. Two RigidBodies need to be defined to use it. Mostly used to create humanlike joints that behave like a
      * lifeless body.
      * ```plaintext
      *
      *                      anchor - it can twist on one axis and swing on another
      *                            │
      *         z            ┌───┐ │ ┌───┐
      *         ↑            │   │ ↓ │   │        e.g. z = TwistAxis, it can rotate in-itself around this axis
      *    -x ←─┼─→ x        │   │ x │   │        e.g. x = SwingAxis, it can rotate anchored around the base on this axis
      *         ↓            │   │   │   │
      *        -z            └───┘   └───┘         e.g. you can twist the leg in-itself to a certain degree,
      *                                                     but also rotate it forward/backward/left/right to a certain degree
      *                bodyAnchor          bodyTied
      *              (e.g. pelvis)         (e.g. upper-leg)
      *
      * ```
      * Twist equals a rotation around a point without moving on an axis.
      * Swing equals a rotation on a point with a moving local axis.
       * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
      */
    class JointRagdoll extends Joint {
        #private;
        static readonly iSubclass: number;
        protected joint: OIMO.RagdollJoint;
        protected config: OIMO.RagdollJointConfig;
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _axisFirst?: Vector3, _axisSecond?: Vector3, _localAnchor?: Vector3);
        /**
         * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
         *  When changed after initialization the joint needs to be reconnected.
         */
        get axisFirst(): Vector3;
        set axisFirst(_value: Vector3);
        /**
        * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
        *  When changed after initialization the joint needs to be reconnected.
        */
        get axisSecond(): Vector3;
        set axisSecond(_value: Vector3);
        /**
         * The maximum angle of rotation along the first axis. Value needs to be positive. Changes do rebuild the joint
         */
        get maxAngleFirstAxis(): number;
        set maxAngleFirstAxis(_value: number);
        /**
         * The maximum angle of rotation along the second axis. Value needs to be positive. Changes do rebuild the joint
         */
        get maxAngleSecondAxis(): number;
        set maxAngleSecondAxis(_value: number);
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingTwist(): number;
        set springDampingTwist(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencyTwist(): number;
        set springFrequencyTwist(_value: number);
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingSwing(): number;
        set springDampingSwing(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencySwing(): number;
        set springFrequencySwing(_value: number);
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
         */
        get maxMotorTwist(): number;
        set maxMotorTwist(_value: number);
        /**
         * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get minMotorTwist(): number;
        set minMotorTwist(_value: number);
        /**
          * The target rotational speed of the motor in m/s.
         */
        get motorSpeedTwist(): number;
        set motorSpeedTwist(_value: number);
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get motorTorqueTwist(): number;
        set motorTorqueTwist(_value: number);
        /**
          * If the two connected RigidBodies collide with eath other. (Default = false)
         */
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        getMutator(): Mutator;
        protected constructJoint(): void;
    }
}
declare namespace FudgeCore {
    /**
       * A physical connection between two bodies with a defined axe of rotation. Also known as HINGE joint.
       * Two RigidBodies need to be defined to use it. A motor can be defined to rotate the connected along the defined axis.
       *
       * ```plaintext
       *                  rotation axis, 1st Degree of freedom
       *                    ↑
       *               ┌───┐│┌────┐
       *               │   │││    │
       *               │   │││    │
       *               │   │││    │
       *               └───┘│└────┘
       *                    │
       *      bodyAnchor         bodyTied
       *   (e.g. Doorhinge)       (e.g. Door)
       * ```
       * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
       */
    class JointRevolute extends JointAxial {
        #private;
        static readonly iSubclass: number;
        protected joint: OIMO.RevoluteJoint;
        protected config: OIMO.RevoluteJointConfig;
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _axis?: Vector3, _localAnchor?: Vector3);
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
         */
        set maxMotor(_value: number);
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        set minMotor(_value: number);
        /**
          * The maximum motor force in Newton. force <= 0 equals disabled.
         */
        get motorTorque(): number;
        set motorTorque(_value: number);
        /**
          * If the two connected RigidBodies collide with eath other. (Default = false)
         */
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        mutate(_mutator: Mutator): Promise<void>;
        protected constructJoint(): void;
    }
}
declare namespace FudgeCore {
    /**
       * A physical connection between two bodies with three Degrees of Freedom, also known as ball and socket joint. Two bodies connected at their anchor but free to rotate.
       * Used for things like the connection of bones in the human shoulder (if simplified, else better use JointRagdoll). Two RigidBodies need to be defined to use it. Only spring settings can be defined.
       * 3 Degrees are swing horizontal, swing vertical and twist.
       *
       * ```plaintext
       *              JointHolder
       *         z      bodyAnchor (e.g. Human-Shoulder)
       *      y  ↑
       *        \|          ───(●───
       *  -x <---|---> x           bodyTied
       *         |\                (e.g. Upper-Arm)
       *         ↓ -y
       *        -z
       * ```
       * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
       */
    class JointSpherical extends Joint {
        #private;
        static readonly iSubclass: number;
        protected joint: OIMO.SphericalJoint;
        protected config: OIMO.SphericalJointConfig;
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _localAnchor?: Vector3);
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDamping(): number;
        set springDamping(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequency(): number;
        set springFrequency(_value: number);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutator(): Mutator;
        mutate(_mutator: Mutator): Promise<void>;
        protected constructJoint(): void;
    }
}
declare namespace FudgeCore {
    /**
       * A physical connection between two bodies with two defined axis (normally e.g. (0,0,1) and rotation(1,0,0)), they share the same anchor and have free rotation, but transfer the twist.
       * In reality used in cars to transfer the more stable stationary force on the velocity axis to the bumping, damped moving wheel. Two RigidBodies need to be defined to use it.
       * The two motors can be defined for the two rotation axis, along with springs.
       * ```plaintext
       *
       *                      anchor - twist is transfered between bodies
       *         z                   |
       *         ↑            -----  |  ------------
       *         |           |     | ↓ |            |
       *  -x <---|---> x     |     | x |            |           e.g. wheel can still turn up/down,
       *         |           |     |   |            |           left right but transfering it's rotation on to the wheel-axis.
       *         ↓            -----     ------------
       *        -z
       *                 attachedRB          connectedRB
       *                (e.g. wheel)       (e.g. wheel-axis)
       * ```
     * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
       */
    class JointUniversal extends Joint {
        #private;
        static readonly iSubclass: number;
        protected joint: OIMO.UniversalJoint;
        protected config: OIMO.UniversalJointConfig;
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _axisFirst?: Vector3, _axisSecond?: Vector3, _localAnchor?: Vector3);
        /**
         * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
         *  When changed after initialization the joint needs to be reconnected.
         */
        get axisFirst(): Vector3;
        set axisFirst(_value: Vector3);
        /**
        * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
        *  When changed after initialization the joint needs to be reconnected.
        */
        get axisSecond(): Vector3;
        set axisSecond(_value: Vector3);
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingFirst(): number;
        set springDampingFirst(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencyFirst(): number;
        set springFrequencyFirst(_value: number);
        /**
         * The damping of the spring. 1 equals completly damped.
         */
        get springDampingSecond(): number;
        set springDampingSecond(_value: number);
        /**
         * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
        */
        get springFrequencySecond(): number;
        set springFrequencySecond(_value: number);
        /**
          * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
         */
        get maxRotorFirst(): number;
        set maxRotorFirst(_value: number);
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get minRotorFirst(): number;
        set minRotorFirst(_value: number);
        /**
          * The target rotational speed of the motor in m/s.
         */
        get rotorSpeedFirst(): number;
        set rotorSpeedFirst(_value: number);
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get rotorTorqueFirst(): number;
        set rotorTorqueFirst(_value: number);
        /**
        * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
       */
        get maxRotorSecond(): number;
        set maxRotorSecond(_value: number);
        /**
          * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
         */
        get minRotorSecond(): number;
        set minRotorSecond(_value: number);
        /**
          * The target rotational speed of the motor in m/s.
         */
        get rotorSpeedSecond(): number;
        set rotorSpeedSecond(_value: number);
        /**
          * The maximum motor torque in Newton. force <= 0 equals disabled.
         */
        get rotorTorqueSecond(): number;
        set rotorTorqueSecond(_value: number);
        /**
          * If the two connected RigidBodies collide with eath other. (Default = false)
         */
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        getMutator(): Mutator;
        protected constructJoint(): void;
    }
}
declare namespace FudgeCore {
    /**
       * A physical connection between two bodies with no movement.
       * Best way to simulate convex objects like a chair seat connected to chair legs.
       * The actual anchor point does not matter that much, only in very specific edge cases.
       * Because welding means they simply do not disconnect. (unless you add Breakability)
     * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
       */
    class JointWelding extends Joint {
        static readonly iSubclass: number;
        protected joint: OIMO.GenericJoint;
        protected config: OIMO.GenericJointConfig;
        constructor(_bodyAnchor?: ComponentRigidbody, _bodyTied?: ComponentRigidbody, _localAnchor?: Vector3);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected constructJoint(): void;
    }
}
declare namespace FudgeCore {
    /**
      * Manages the OIMO physics engine for FUDGE. Multiple instances may be created, one is active at a time.
      * All methods are static and use the currently active instance. At startup, a default instance is created and become the active instance
      * Attaching a {@link ComponentRigidbody} to a {@link Node} places a physics collider in the physics instance active at that time.
      * @author Marko Fehrenbach, HFU 2020
      */
    class Physics {
        #private;
        /** The SETTINGS that apply to the physical world. Ranging from things like sleeping, collisionShapeThickness and others */
        static settings: PhysicsSettings;
        private static ƒactive;
        private oimoWorld;
        private bodyList;
        private jointList;
        constructor();
        /**
         * Define the currently active Physics instance
         */
        static set activeInstance(_physics: Physics);
        /** Get the currently active Physics instance */
        static get activeInstance(): Physics;
        static get debugDraw(): PhysicsDebugDraw;
        static get mainCam(): ComponentCamera;
        /**
        * Cast a RAY into the physical world from a origin point in a certain direction. Receiving informations about the hit object and the
        * hit point. Do not specify a _group to raycast the whole world, else only bodies within the specific group can be hit.
        */
        static raycast(_origin: Vector3, _direction: Vector3, _length?: number, _debugDraw?: boolean, _group?: COLLISION_GROUP): RayHitInfo;
        /**
        * Simulates the physical world. _deltaTime is the amount of time between physical steps, default is 60 frames per second ~17ms.
        * A frame timing can't be smaller than 1/30 of a second, or else it will be set to 30 frames, to have more consistent frame calculations.
        */
        static simulate(_deltaTime?: number): void;
        /**
         * Draw information about the currently active instance using the {@link ComponentCamera} given
         */
        static draw(_cmpCamera: ComponentCamera, _mode?: PHYSICS_DEBUGMODE): void;
        /**
          * Adjusts the transforms of the {@link ComponentRigidbody}s in the given branch to match their nodes or meshes
          */
        static adjustTransforms(_branch: Node, _toMesh?: boolean): void;
        /**
        * Get the applied gravitational force of the active instance. Default earth gravity = 9.81 m/s
        */
        static getGravity(): Vector3;
        /**
        * Set the applied gravitational force of the active instance. Default earth gravity = 9.81 m/s
        */
        static setGravity(_value: Vector3): void;
        /**
        * Add a new OIMO Rigidbody to the active instance, happens automatically when adding a FUDGE Rigidbody Component.
        */
        static addRigidbody(_cmpRB: ComponentRigidbody): void;
        /**
        * Remove the OIMO Rigidbody to the active instance, happens automatically when removing a FUDGE Rigidbody Component
        */
        static removeRigidbody(_cmpRB: ComponentRigidbody): void;
        /**
        * Add a new OIMO Joint/Constraint to the active instance, happens automatically when adding a FUDGE Joint Component
        */
        static addJoint(_cmpJoint: Joint): void;
        /**
        * Called internally to inform the physics system that a joint has a change of core properties and needs to be recreated.
        */
        static changeJointStatus(_cmpJoint: Joint): void;
        /**
          * Remove the OIMO Joint/Constraint to the active instance, happens automatically when removing a FUDGE Joint Component
          */
        static removeJoint(_cmpJoint: Joint): void;
        /** Returns all the ComponentRigidbodies that are known to the active instance. */
        static getBodyList(): ComponentRigidbody[];
        /** Giving a ComponentRigidbody a specific identification number so it can be referenced in the loading process. And removed rb's can receive a new id. */
        static distributeBodyID(): number;
        /**
         * Connect all joints that are not connected yet. Used internally no user interaction needed. This functionality is called and needed to make sure joints connect/disconnect
         * if any of the two paired ComponentRigidbodies change.
         */
        static connectJoints(): void;
        /** Remove all oimo joints and rigidbodies, so that they can be reused in another world  */
        static cleanup(): void;
        /** Internal function to calculate the endpoint of mathematical ray. By adding the multiplied direction to the origin.
           * Used because OimoPhysics defines ray by start/end. But GameEngines commonly use origin/direction.
           */
        private static getRayEndPoint;
        /** Internal function to get the distance in which a ray hit by subtracting points from each other and get the square root of the squared product of each component. */
        private static getRayDistance;
        getOimoWorld(): OIMO.World;
    }
}
declare namespace FudgeCore {
    /**
      * Storing and manipulating rotations in the form of quaternions.
      * Constructed out of the 4 components x,y,z,w. Commonly used to calculate rotations in physics engines.
      * Class mostly used internally to bridge the in FUDGE commonly used angles in degree to OimoPhysics quaternion system.
      * @authors Marko Fehrenbach, HFU, 2020
      */
    class Quaternion extends Mutable {
        private x;
        private y;
        private z;
        private w;
        constructor(_x?: number, _y?: number, _z?: number, _w?: number);
        /** Get/Set the X component of the Quaternion. Real Part */
        get X(): number;
        set X(_x: number);
        /** Get/Set the Y component of the Quaternion. Real Part */
        get Y(): number;
        set Y(_y: number);
        /** Get/Set the Z component of the Quaternion. Real Part */
        get Z(): number;
        set Z(_z: number);
        /** Get/Set the Y component of the Quaternion. Imaginary Part */
        get W(): number;
        set W(_w: number);
        /**
         * Create quaternion from vector3 angles in degree
         */
        setFromVector3(rollX: number, pitchY: number, yawZ: number): void;
        /**
         * Returns the euler angles in radians as Vector3 from this quaternion.
         */
        toEulerangles(): Vector3;
        /**
         * Return angles in degrees as vector3 from this. quaterion
         */
        toDegrees(): Vector3;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
        /** Copying the sign of a to b */
        private copysign;
    }
}
declare namespace FudgeCore {
    /**
     * Defines a threedimensional box by two corner-points, one with minimal values and one with maximum values
     */
    class Box implements Recycable {
        min: Vector3;
        max: Vector3;
        constructor(_min?: Vector3, _max?: Vector3);
        /**
         * Define the corners of this box, standard values are Infinity for min, and -Infinity for max,
         * creating an impossible inverted box that can not contain any points
         */
        set(_min?: Vector3, _max?: Vector3): void;
        /**
         * Expand the box if necessary to include the given point
         */
        expand(_include: Vector3): void;
        recycle(): void;
    }
}
declare namespace FudgeCore {
    /**
     * Stores information provided by {@link Render}-picking e.g. using {@link Picker} and provides methods for further calculation of positions and normals etc.
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Pick {
        #private;
        node: Node;
        zBuffer: number;
        color: Color;
        textureUV: Vector2;
        constructor(_node: Node);
        /**
         * Accessor to calculate and store world position of intersection of {@link Ray} and {@link Mesh} only when used.
         */
        get posWorld(): Vector3;
        /**
         * Accessor to calculate and store position in mesh-space of intersection of {@link Ray} and {@link Mesh} only when used.
         */
        get posMesh(): Vector3;
        /**
         * Accessor to calculate and store the face normal in world-space at the point of intersection of {@link Ray} and {@link Mesh} only when used.
         */
        get normal(): Vector3;
        /**
         * Called solely by the renderer to enable calculation of the world coordinates of this {@link Pick}
         */
        set mtxViewToWorld(_mtxViewToWorld: Matrix4x4);
    }
}
declare namespace FudgeCore {
    /**
     * Provides static methods for picking using {@link Render}
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Picker {
        /**
         * Takes a ray plus min and max values for the near and far planes to construct the picker-camera,
         * then renders the pick-texture and returns an unsorted {@link Pick}-array with information about the hits of the ray.
         */
        static pickRay(_nodes: Node[], _ray: Ray, _min: number, _max: number): Pick[];
        /**
         * Takes a camera and a point on its virtual normed projection plane (distance 1) to construct the picker-camera,
         * then renders the pick-texture and returns an unsorted {@link Pick}-array with information about the hits of the ray.
         */
        static pickCamera(_nodes: Node[], _cmpCamera: ComponentCamera, _posProjection: Vector2): Pick[];
        /**
         * Takes the camera of the given viewport and a point the client surface to construct the picker-camera,
         * then renders the pick-texture and returns an unsorted {@link Pick}-array with information about the hits of the ray.
         */
        static pickViewport(_viewport: Viewport, _posClient: Vector2): Pick[];
    }
}
declare namespace FudgeCore {
    /**
     * Defined by an origin and a direction of type {@link Pick}, rays are used to calculate picking and intersections
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Ray {
        origin: Vector3;
        direction: Vector3;
        /** TODO: support length */
        length: number;
        constructor(_direction?: Vector3, _origin?: Vector3, _length?: number);
        /**
         * Returns the point of intersection of this ray with a plane defined by
         * the given point of origin and the planes normal. All values and calculations
         * must be relative to the same coordinate system, preferably the world
         */
        intersectPlane(_origin: Vector3, _normal: Vector3): Vector3;
        /**
         * Returns the point of intersection of this ray with a plane defined by the face.
         * All values and calculations must be relative to the same coordinate system, preferably the world
         */
        intersectFacePlane(_face: Face): Vector3;
        /**
         * Returns the shortest distance from the ray to the given target point.
         * All values and calculations must be relative to the same coordinate system, preferably the world.
         */
        getDistance(_target: Vector3): Vector3;
        /**
         * Transform the ray by the given matrix
         */
        transform(_mtxTransform: Matrix4x4): void;
        /**
         * Returns a readable string representation of this ray
         */
        toString(): string;
    }
}
declare namespace FudgeCore {
    type MapLightTypeToLightList = Map<TypeOfLight, RecycableArray<ComponentLight>>;
    interface RenderPrepareOptions {
        ignorePhysics?: boolean;
    }
    /**
     * The main interface to the render engine, here WebGL (see superclass {@link RenderWebGL} and the RenderInjectors
     */
    abstract class Render extends RenderWebGL {
        static rectClip: Rectangle;
        static pickBuffer: Int32Array;
        static nodesPhysics: RecycableArray<Node>;
        static componentsPick: RecycableArray<ComponentPick>;
        static lights: MapLightTypeToLightList;
        private static nodesSimple;
        private static nodesAlpha;
        private static timestampUpdate;
        /**
         * Recursively iterates over the branch starting with the node given, recalculates all world transforms,
         * collects all lights and feeds all shaders used in the graph with these lights. Sorts nodes for different
         * render passes.
         */
        static prepare(_branch: Node, _options?: RenderPrepareOptions, _mtxWorld?: Matrix4x4, _shadersUsed?: (typeof Shader)[]): void;
        static addLights(cmpLights: ComponentLight[]): void;
        /**
         * Used with a {@link Picker}-camera, this method renders one pixel with picking information
         * for each node in the line of sight and return that as an unsorted {@link Pick}-array
         */
        static pickBranch(_nodes: Node[], _cmpCamera: ComponentCamera): Pick[];
        static draw(_cmpCamera: ComponentCamera): void;
        private static drawListAlpha;
        private static drawList;
        private static transformByPhysics;
    }
}
declare namespace FudgeCore {
    /**
     * Inserted into a {@link Mesh}, an instance of this class calculates and represents the mesh data in the form needed by the render engine
     */
    interface RenderBuffers {
        vertices?: WebGLBuffer;
        indices?: WebGLBuffer;
        textureUVs?: WebGLBuffer;
        normals?: WebGLBuffer;
        iBones?: WebGLBuffer;
        weights?: WebGLBuffer;
        nIndices?: number;
    }
    class RenderMesh {
        smooth: RenderBuffers;
        flat: RenderBuffers;
        mesh: Mesh;
        /** vertices of the actual point cloud, some points might be in the same location in order to refer to different texels */
        protected ƒvertices: Float32Array;
        /** indices to create faces from the vertices, rotation determines direction of face-normal */
        protected ƒindices: Uint16Array;
        /** texture coordinates associated with the vertices by the position in the array */
        protected ƒtextureUVs: Float32Array;
        /** vertex normals for smooth shading, interpolated between vertices during rendering */
        protected ƒnormalsVertex: Float32Array;
        /** bones */
        protected ƒiBones: Uint8Array;
        protected ƒweights: Float32Array;
        /** flat-shading: normalized face normals, every third entry is used only */
        protected ƒnormalsFlat: Float32Array;
        /** flat-shading: extra vertex array, since using vertices with multiple faces is rarely possible due to the limitation above */
        protected ƒverticesFlat: Float32Array;
        /** flat-shading: therefore an extra indices-array is needed */
        protected ƒindicesFlat: Uint16Array;
        /** flat-shading: and an extra textureUV-array */
        protected ƒtextureUVsFlat: Float32Array;
        /** bones */
        protected ƒiBonesFlat: Uint8Array;
        protected ƒweightsFlat: Float32Array;
        constructor(_mesh: Mesh);
        get iBones(): Uint8Array;
        get weights(): Float32Array;
        get vertices(): Float32Array;
        get indices(): Uint16Array;
        get normalsVertex(): Float32Array;
        get textureUVs(): Float32Array;
        get verticesFlat(): Float32Array;
        get indicesFlat(): Uint16Array;
        get normalsFlat(): Float32Array;
        get textureUVsFlat(): Float32Array;
        get iBonesFlat(): Uint8Array;
        get weightsFlat(): Float32Array;
        clear(): void;
        protected createVerticesFlat(): Float32Array;
        protected createNormalsFlat(): Float32Array;
        protected createTextureUVsFlat(): Float32Array;
    }
}
declare namespace FudgeCore {
    abstract class RenderParticles extends Render {
        static drawParticles(): void;
    }
}
declare namespace FudgeCore {
    /**
     * Controls the rendering of a branch, using the given {@link ComponentCamera},
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of {@link Framing} objects. The stages involved are in order of rendering
     * {@link Render}.viewport -> {@link Viewport}.source -> {@link Viewport}.destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019-2022
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Viewport
     */
    class Viewport extends EventTargetƒ {
        #private;
        private static focus;
        name: string;
        camera: ComponentCamera;
        rectSource: Rectangle;
        rectDestination: Rectangle;
        frameClientToCanvas: FramingScaled;
        frameCanvasToDestination: FramingComplex;
        frameDestinationToSource: FramingScaled;
        frameSourceToRender: FramingScaled;
        adjustingFrames: boolean;
        adjustingCamera: boolean;
        physicsDebugMode: PHYSICS_DEBUGMODE;
        componentsPick: RecycableArray<ComponentPick>;
        /**
         * Returns true if this viewport currently has focus and thus receives keyboard events
         */
        get hasFocus(): boolean;
        /**
         * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
         */
        initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void;
        /**
         * Retrieve the destination canvas
         */
        getCanvas(): HTMLCanvasElement;
        /**
         * Retrieve the 2D-context attached to the destination canvas
         */
        getContext(): CanvasRenderingContext2D;
        /**
         * Retrieve the size of the destination canvas as a rectangle, x and y are always 0
         */
        getCanvasRectangle(): Rectangle;
        /**
         * Retrieve the client rectangle the canvas is displayed and fit in, x and y are always 0
         */
        getClientRectangle(): Rectangle;
        /**
         * Set the branch to be drawn in the viewport.
         */
        setBranch(_branch: Node): void;
        /**
         * Retrieve the branch this viewport renders
         */
        getBranch(): Node;
        /**
         * Logs this viewports scenegraph to the console.
         * TODO: remove this method, since it's implemented in Debug
         */
        showSceneGraph(): void;
        /**
         * Draw this viewport displaying its branch. By default, the transforms in the branch are recalculated first.
         * Pass `false` if calculation was already done for this frame
         */
        draw(_calculateTransforms?: boolean): void;
        /**
         * Calculate the cascade of transforms in this branch and store the results as mtxWorld in the {@link Node}s and {@link ComponentMesh}es
         */
        calculateTransforms(): void;
        dispatchPointerEvent(_event: PointerEvent): void;
        /**
         * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
         */
        adjustFrames(): void;
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        adjustCamera(): void;
        /**
         * Returns a {@link Ray} in world coordinates from this camera through the point given in client space
         */
        getRayFromClient(_point: Vector2): Ray;
        /**
         * Returns a point on the client rectangle matching the projection of the given point in world space
         */
        pointWorldToClient(_position: Vector3): Vector2;
        /**
         * Returns a point on the source-rectangle matching the given point on the client rectangle
         */
        pointClientToSource(_client: Vector2): Vector2;
        /**
         * Returns a point on the render-rectangle matching the given point on the source rectangle
         */
        pointSourceToRender(_source: Vector2): Vector2;
        /**
         * Returns a point on the render-rectangle matching the given point on the client rectangle
         */
        pointClientToRender(_client: Vector2): Vector2;
        /**
         * Returns a point on a projection surface in the hypothetical distance of 1 to the camera
         * matching the given point on the client rectangle
         * TODO: examine, if this should be a camera-method. Current implementation is for central-projection
         */
        pointClientToProjection(_client: Vector2): Vector2;
        /**
         * Returns a point in the client rectangle matching the given point in normed clipspace rectangle,
         * which stretches from -1 to 1 in both dimensions, y pointing up
         */
        pointClipToClient(_normed: Vector2): Vector2;
        /**
         * Returns a point in the client rectangle matching the given point in normed clipspace rectangle,
         * which stretches from -1 to 1 in both dimensions, y pointing up
         */
        pointClipToCanvas(_normed: Vector2): Vector2;
        /**
         * Returns a point in the browser page matching the given point of the viewport
         */
        pointClientToScreen(_client: Vector2): Vector2;
        /**
         * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events.
         * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire {@link Eventƒ}s accordingly.
         * // TODO: examine, if this can be achieved by regular DOM-Focus and tabindex=0
         */
        setFocus(_on: boolean): void;
        /**
         * De- / Activates the given pointer event to be propagated into the viewport as FUDGE-Event
         */
        activatePointerEvent(_type: EVENT_POINTER, _on: boolean): void;
        /**
         * De- / Activates the given keyboard event to be propagated into the viewport as FUDGE-Event
         */
        activateKeyboardEvent(_type: EVENT_KEYBOARD, _on: boolean): void;
        /**
         * De- / Activates the given drag-drop event to be propagated into the viewport as FUDGE-Event
         */
        activateDragDropEvent(_type: EVENT_DRAGDROP, _on: boolean): void;
        /**
         * De- / Activates the wheel event to be propagated into the viewport as FUDGE-Event
         */
        activateWheelEvent(_type: EVENT_WHEEL, _on: boolean): void;
        /**
         * Handle drag-drop events and dispatch to viewport as FUDGE-Event
         */
        private hndDragDropEvent;
        /**
         * Add position of the pointer mapped to canvas-coordinates as canvasX, canvasY to the event
         */
        private addCanvasPosition;
        /**
         * Handle pointer events and dispatch to viewport as FUDGE-Event
         */
        private hndPointerEvent;
        /**
         * Handle keyboard events and dispatch to viewport as FUDGE-Event, if the viewport has the focus
         */
        private hndKeyboardEvent;
        /**
         * Handle wheel event and dispatch to viewport as FUDGE-Event
         */
        private hndWheelEvent;
        private activateEvent;
        private hndComponentEvent;
    }
}
declare namespace FudgeCore {
    interface MapFilenameToContent {
        [filename: string]: string;
    }
    /**
     * Handles file transfer from a Fudge-Browserapp to the local filesystem without a local server.
     * Saves to the download-path given by the browser, loads from the player's choice.
     */
    class FileIoBrowserLocal extends EventTargetStatic {
        private static selector;
        static load(_multiple?: boolean): Promise<MapFilenameToContent>;
        static save(_toSave: MapFilenameToContent, _type?: string): Promise<MapFilenameToContent>;
        static handleFileSelect(_event: Event): Promise<void>;
        static loadFiles(_fileList: FileList, _loaded: MapFilenameToContent): Promise<void>;
    }
}
declare namespace FudgeCore {
    /**
     * Mutable array of {@link Mutable}s. The {@link Mutator}s of the entries are included as array in the {@link Mutator}
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class MutableArray<T extends Mutable> extends Array<T> {
        rearrange(_sequence: number[]): void;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        getMutator(): Mutator;
        getMutatorForUserInterface(): Mutator;
        mutate(_mutator: Mutator): Promise<void>;
        /**
         * Updates the values of the given mutator according to the current state of the instance
         */
        updateMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    export enum MODE {
        EDITOR = 0,
        RUNTIME = 1
    }
    export interface SerializableResource extends Serializable {
        name: string;
        type: string;
        idResource: string;
    }
    export interface Resources {
        [idResource: string]: SerializableResource;
    }
    export interface SerializationOfResources {
        [idResource: string]: Serialization;
    }
    export interface ScriptNamespaces {
        [name: string]: Object;
    }
    export interface ComponentScripts {
        [namespace: string]: ComponentScript[];
    }
    interface GraphInstancesToResync {
        [idResource: string]: GraphInstance[];
    }
    /**
     * Static class handling the resources used with the current FUDGE-instance.
     * Keeps a list of the resources and generates ids to retrieve them.
     * Resources are objects referenced multiple times but supposed to be stored only once
     */
    export abstract class Project extends EventTargetStatic {
        static resources: Resources;
        static serialization: SerializationOfResources;
        static scriptNamespaces: ScriptNamespaces;
        static baseURL: URL;
        static mode: MODE;
        static graphInstancesToResync: GraphInstancesToResync;
        /**
         * Registers the resource and generates an id for it by default.
         * If the resource already has an id, thus having been registered, its deleted from the list and registered anew.
         * It's possible to pass an id, but should not be done except by the Serializer.
         */
        static register(_resource: SerializableResource, _idResource?: string): void;
        static deregister(_resource: SerializableResource): void;
        static clear(): void;
        static getResourcesByType<T>(_type: new (_args: General) => T): SerializableResource[];
        static getResourcesByName(_name: string): SerializableResource[];
        /**
         * Generate a user readable and unique id using the type of the resource, the date and random numbers
         * @param _resource
         */
        static generateId(_resource: SerializableResource): string;
        /**
         * Tests, if an object is a {@link SerializableResource}
         * @param _object The object to examine
         */
        static isResource(_object: Serializable): boolean;
        /**
         * Retrieves the resource stored with the given id
         */
        static getResource(_idResource: string): Promise<SerializableResource>;
        /**
         * Creates and registers a resource from a {@link Node}, copying the complete graph starting with it
         * @param _node A node to create the resource from
         * @param _replaceWithInstance if true (default), the node used as origin is replaced by a {@link GraphInstance} of the {@link Graph} created
         */
        static registerAsGraph(_node: Node, _replaceWithInstance?: boolean): Promise<Graph>;
        /**
         * Creates and returns a {@link GraphInstance} of the given {@link Graph}
         * and connects it to the graph for synchronisation of mutation.
         */
        static createGraphInstance(_graph: Graph): Promise<GraphInstance>;
        static registerGraphInstanceForResync(_instance: GraphInstance): void;
        static resyncGraphInstances(_graph: Graph): Promise<void>;
        static registerScriptNamespace(_namespace: Object): void;
        static getComponentScripts(): ComponentScripts;
        static loadScript(_url: RequestInfo): Promise<void>;
        static loadResources(_url: RequestInfo): Promise<Resources>;
        static loadResourcesFromHTML(): Promise<void>;
        /**
         * Serialize all resources
         */
        static serialize(): SerializationOfResources;
        /**
         * Create resources from a serialization, deleting all resources previously registered
         * @param _serialization
         */
        static deserialize(_serialization: SerializationOfResources): Promise<Resources>;
        private static deserializeResource;
    }
    export {};
}
declare namespace GLTF {
    type GlTfId = number;
    /**
     * An object pointing to a buffer view containing the indices of deviating accessor values. The number of indices is equal to `accessor.sparse.count`. Indices **MUST** strictly increase.
     */
    interface AccessorSparseIndices {
        /**
         * The index of the buffer view with sparse indices. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined. The buffer view and the optional `byteOffset` **MUST** be aligned to the `componentType` byte length.
         */
        "bufferView": GlTfId;
        /**
         * The offset relative to the start of the buffer view in bytes.
         */
        "byteOffset"?: number;
        /**
         * The indices data type.
         */
        "componentType": number | number | number | number;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * An object pointing to a buffer view containing the deviating accessor values. The number of elements is equal to `accessor.sparse.count` times number of components. The elements have the same component type as the base accessor. The elements are tightly packed. Data **MUST** be aligned following the same rules as the base accessor.
     */
    interface AccessorSparseValues {
        /**
         * The index of the bufferView with sparse values. The referenced buffer view **MUST NOT** have its `target` or `byteStride` properties defined.
         */
        "bufferView": GlTfId;
        /**
         * The offset relative to the start of the bufferView in bytes.
         */
        "byteOffset"?: number;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * Sparse storage of accessor values that deviate from their initialization value.
     */
    interface AccessorSparse {
        /**
         * Number of deviating accessor values stored in the sparse array.
         */
        "count": number;
        /**
         * An object pointing to a buffer view containing the indices of deviating accessor values. The number of indices is equal to `count`. Indices **MUST** strictly increase.
         */
        "indices": AccessorSparseIndices;
        /**
         * An object pointing to a buffer view containing the deviating accessor values.
         */
        "values": AccessorSparseValues;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A typed view into a buffer view that contains raw binary data.
     */
    interface Accessor {
        /**
         * The index of the bufferView.
         */
        "bufferView"?: GlTfId;
        /**
         * The offset relative to the start of the buffer view in bytes.
         */
        "byteOffset"?: number;
        /**
         * The datatype of the accessor's components.
         */
        "componentType": number | number | number | number | number | number | number;
        /**
         * Specifies whether integer data values are normalized before usage.
         */
        "normalized"?: boolean;
        /**
         * The number of elements referenced by this accessor.
         */
        "count": number;
        /**
         * Specifies if the accessor's elements are scalars, vectors, or matrices.
         */
        "type": any | any | any | any | any | any | any | string;
        /**
         * Maximum value of each component in this accessor.
         */
        "max"?: number[];
        /**
         * Minimum value of each component in this accessor.
         */
        "min"?: number[];
        /**
         * Sparse storage of elements that deviate from their initialization value.
         */
        "sparse"?: AccessorSparse;
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * The descriptor of the animated property.
     */
    interface AnimationChannelTarget {
        /**
         * The index of the node to animate. When undefined, the animated object **MAY** be defined by an extension.
         */
        "node"?: GlTfId;
        /**
         * The name of the node's TRS property to animate, or the `"weights"` of the Morph Targets it instantiates. For the `"translation"` property, the values that are provided by the sampler are the translation along the X, Y, and Z axes. For the `"rotation"` property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the `"scale"` property, the values are the scaling factors along the X, Y, and Z axes.
         */
        "path": any | any | any | any | string;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * An animation channel combines an animation sampler with a target property being animated.
     */
    interface AnimationChannel {
        /**
         * The index of a sampler in this animation used to compute the value for the target.
         */
        "sampler": GlTfId;
        /**
         * The descriptor of the animated property.
         */
        "target": AnimationChannelTarget;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm.
     */
    interface AnimationSampler {
        /**
         * The index of an accessor containing keyframe timestamps.
         */
        "input": GlTfId;
        /**
         * Interpolation algorithm.
         */
        "interpolation"?: any | any | any | string;
        /**
         * The index of an accessor, containing keyframe output values.
         */
        "output": GlTfId;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A keyframe animation.
     */
    interface Animation {
        /**
         * An array of animation channels. An animation channel combines an animation sampler with a target property being animated. Different channels of the same animation **MUST NOT** have the same targets.
         */
        "channels": AnimationChannel[];
        /**
         * An array of animation samplers. An animation sampler combines timestamps with a sequence of output values and defines an interpolation algorithm.
         */
        "samplers": AnimationSampler[];
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * Metadata about the glTF asset.
     */
    interface Asset {
        /**
         * A copyright message suitable for display to credit the content creator.
         */
        "copyright"?: string;
        /**
         * Tool that generated this glTF model.  Useful for debugging.
         */
        "generator"?: string;
        /**
         * The glTF version in the form of `<major>.<minor>` that this asset targets.
         */
        "version": string;
        /**
         * The minimum glTF version in the form of `<major>.<minor>` that this asset targets. This property **MUST NOT** be greater than the asset version.
         */
        "minVersion"?: string;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A buffer points to binary geometry, animation, or skins.
     */
    interface Buffer {
        /**
         * The URI (or IRI) of the buffer.
         */
        "uri"?: string;
        /**
         * The length of the buffer in bytes.
         */
        "byteLength": number;
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A view into a buffer generally representing a subset of the buffer.
     */
    interface BufferView {
        /**
         * The index of the buffer.
         */
        "buffer": GlTfId;
        /**
         * The offset into the buffer in bytes.
         */
        "byteOffset"?: number;
        /**
         * The length of the bufferView in bytes.
         */
        "byteLength": number;
        /**
         * The stride, in bytes.
         */
        "byteStride"?: number;
        /**
         * The hint representing the intended GPU buffer type to use with this buffer view.
         */
        "target"?: number | number | number;
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * An orthographic camera containing properties to create an orthographic projection matrix.
     */
    interface CameraOrthographic {
        /**
         * The floating-point horizontal magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative.
         */
        "xmag": number;
        /**
         * The floating-point vertical magnification of the view. This value **MUST NOT** be equal to zero. This value **SHOULD NOT** be negative.
         */
        "ymag": number;
        /**
         * The floating-point distance to the far clipping plane. This value **MUST NOT** be equal to zero. `zfar` **MUST** be greater than `znear`.
         */
        "zfar": number;
        /**
         * The floating-point distance to the near clipping plane.
         */
        "znear": number;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A perspective camera containing properties to create a perspective projection matrix.
     */
    interface CameraPerspective {
        /**
         * The floating-point aspect ratio of the field of view.
         */
        "aspectRatio"?: number;
        /**
         * The floating-point vertical field of view in radians. This value **SHOULD** be less than π.
         */
        "yfov": number;
        /**
         * The floating-point distance to the far clipping plane.
         */
        "zfar"?: number;
        /**
         * The floating-point distance to the near clipping plane.
         */
        "znear": number;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A camera's projection.  A node **MAY** reference a camera to apply a transform to place the camera in the scene.
     */
    interface Camera {
        /**
         * An orthographic camera containing properties to create an orthographic projection matrix. This property **MUST NOT** be defined when `perspective` is defined.
         */
        "orthographic"?: CameraOrthographic;
        /**
         * A perspective camera containing properties to create a perspective projection matrix. This property **MUST NOT** be defined when `orthographic` is defined.
         */
        "perspective"?: CameraPerspective;
        /**
         * Specifies if the camera uses a perspective or orthographic projection.
         */
        "type": any | any | string;
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * Image data used to create a texture. Image **MAY** be referenced by an URI (or IRI) or a buffer view index.
     */
    interface Image {
        /**
         * The URI (or IRI) of the image.
         */
        "uri"?: string;
        /**
         * The image's media type. This field **MUST** be defined when `bufferView` is defined.
         */
        "mimeType"?: any | any | string;
        /**
         * The index of the bufferView that contains the image. This field **MUST NOT** be defined when `uri` is defined.
         */
        "bufferView"?: GlTfId;
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * Reference to a texture.
     */
    interface TextureInfo {
        /**
         * The index of the texture.
         */
        "index": GlTfId;
        /**
         * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
         */
        "texCoord"?: number;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology.
     */
    interface MaterialPbrMetallicRoughness {
        /**
         * The factors for the base color of the material.
         */
        "baseColorFactor"?: number[];
        /**
         * The base color texture.
         */
        "baseColorTexture"?: TextureInfo;
        /**
         * The factor for the metalness of the material.
         */
        "metallicFactor"?: number;
        /**
         * The factor for the roughness of the material.
         */
        "roughnessFactor"?: number;
        /**
         * The metallic-roughness texture.
         */
        "metallicRoughnessTexture"?: TextureInfo;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    interface MaterialNormalTextureInfo {
        "index"?: any;
        "texCoord"?: any;
        /**
         * The scalar parameter applied to each normal vector of the normal texture.
         */
        "scale"?: number;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    interface MaterialOcclusionTextureInfo {
        "index"?: any;
        "texCoord"?: any;
        /**
         * A scalar multiplier controlling the amount of occlusion applied.
         */
        "strength"?: number;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * The material appearance of a primitive.
     */
    interface Material {
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        /**
         * A set of parameter values that are used to define the metallic-roughness material model from Physically Based Rendering (PBR) methodology. When undefined, all the default values of `pbrMetallicRoughness` **MUST** apply.
         */
        "pbrMetallicRoughness"?: MaterialPbrMetallicRoughness;
        /**
         * The tangent space normal texture.
         */
        "normalTexture"?: MaterialNormalTextureInfo;
        /**
         * The occlusion texture.
         */
        "occlusionTexture"?: MaterialOcclusionTextureInfo;
        /**
         * The emissive texture.
         */
        "emissiveTexture"?: TextureInfo;
        /**
         * The factors for the emissive color of the material.
         */
        "emissiveFactor"?: number[];
        /**
         * The alpha rendering mode of the material.
         */
        "alphaMode"?: any | any | any | string;
        /**
         * The alpha cutoff value of the material.
         */
        "alphaCutoff"?: number;
        /**
         * Specifies whether the material is double sided.
         */
        "doubleSided"?: boolean;
        [k: string]: any;
    }
    /**
     * Geometry to be rendered with the given material.
     */
    interface MeshPrimitive {
        /**
         * A plain JSON object, where each key corresponds to a mesh attribute semantic and each value is the index of the accessor containing attribute's data.
         */
        "attributes": {
            [k: string]: GlTfId;
        };
        /**
         * The index of the accessor that contains the vertex indices.
         */
        "indices"?: GlTfId;
        /**
         * The index of the material to apply to this primitive when rendering.
         */
        "material"?: GlTfId;
        /**
         * The topology type of primitives to render.
         */
        "mode"?: number | number | number | number | number | number | number | number;
        /**
         * An array of morph targets.
         */
        "targets"?: {
            [k: string]: GlTfId;
        }[];
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A set of primitives to be rendered.  Its global transform is defined by a node that references it.
     */
    interface Mesh {
        /**
         * An array of primitives, each defining geometry to be rendered.
         */
        "primitives": MeshPrimitive[];
        /**
         * Array of weights to be applied to the morph targets. The number of array elements **MUST** match the number of morph targets.
         */
        "weights"?: number[];
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` **MUST** contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node **MAY** have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), `matrix` **MUST NOT** be present.
     */
    interface Node {
        /**
         * The index of the camera referenced by this node.
         */
        "camera"?: GlTfId;
        /**
         * The indices of this node's children.
         */
        "children"?: GlTfId[];
        /**
         * The index of the skin referenced by this node.
         */
        "skin"?: GlTfId;
        /**
         * A floating-point 4x4 transformation matrix stored in column-major order.
         */
        "matrix"?: number[];
        /**
         * The index of the mesh in this node.
         */
        "mesh"?: GlTfId;
        /**
         * The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar.
         */
        "rotation"?: number[];
        /**
         * The node's non-uniform scale, given as the scaling factors along the x, y, and z axes.
         */
        "scale"?: number[];
        /**
         * The node's translation along the x, y, and z axes.
         */
        "translation"?: number[];
        /**
         * The weights of the instantiated morph target. The number of array elements **MUST** match the number of morph targets of the referenced mesh. When defined, `mesh` **MUST** also be defined.
         */
        "weights"?: number[];
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * Texture sampler properties for filtering and wrapping modes.
     */
    interface Sampler {
        /**
         * Magnification filter.
         */
        "magFilter"?: number | number | number;
        /**
         * Minification filter.
         */
        "minFilter"?: number | number | number | number | number | number | number;
        /**
         * S (U) wrapping mode.
         */
        "wrapS"?: number | number | number | number;
        /**
         * T (V) wrapping mode.
         */
        "wrapT"?: number | number | number | number;
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * The root nodes of a scene.
     */
    interface Scene {
        /**
         * The indices of each root node.
         */
        "nodes"?: GlTfId[];
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * Joints and matrices defining a skin.
     */
    interface Skin {
        /**
         * The index of the accessor containing the floating-point 4x4 inverse-bind matrices.
         */
        "inverseBindMatrices"?: GlTfId;
        /**
         * The index of the node used as a skeleton root.
         */
        "skeleton"?: GlTfId;
        /**
         * Indices of skeleton nodes, used as joints in this skin.
         */
        "joints": GlTfId[];
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * A texture and its sampler.
     */
    interface Texture {
        /**
         * The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering **SHOULD** be used.
         */
        "sampler"?: GlTfId;
        /**
         * The index of the image used by this texture. When undefined, an extension or other mechanism **SHOULD** supply an alternate texture source, otherwise behavior is undefined.
         */
        "source"?: GlTfId;
        "name"?: any;
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
    /**
     * The root object for a glTF asset.
     */
    interface GlTf {
        /**
         * Names of glTF extensions used in this asset.
         */
        "extensionsUsed"?: string[];
        /**
         * Names of glTF extensions required to properly load this asset.
         */
        "extensionsRequired"?: string[];
        /**
         * An array of accessors.
         */
        "accessors"?: Accessor[];
        /**
         * An array of keyframe animations.
         */
        "animations"?: Animation[];
        /**
         * Metadata about the glTF asset.
         */
        "asset": Asset;
        /**
         * An array of buffers.
         */
        "buffers"?: Buffer[];
        /**
         * An array of bufferViews.
         */
        "bufferViews"?: BufferView[];
        /**
         * An array of cameras.
         */
        "cameras"?: Camera[];
        /**
         * An array of images.
         */
        "images"?: Image[];
        /**
         * An array of materials.
         */
        "materials"?: Material[];
        /**
         * An array of meshes.
         */
        "meshes"?: Mesh[];
        /**
         * An array of nodes.
         */
        "nodes"?: Node[];
        /**
         * An array of samplers.
         */
        "samplers"?: Sampler[];
        /**
         * The index of the default scene.
         */
        "scene"?: GlTfId;
        /**
         * An array of scenes.
         */
        "scenes"?: Scene[];
        /**
         * An array of skins.
         */
        "skins"?: Skin[];
        /**
         * An array of textures.
         */
        "textures"?: Texture[];
        "extensions"?: any;
        "extras"?: any;
        [k: string]: any;
    }
}
declare namespace FudgeCore {
    class GLTFLoader {
        #private;
        private static loaders;
        private static defaultMaterial;
        private static defaultSkinMaterial;
        readonly gltf: GLTF.GlTf;
        readonly uri: string;
        private constructor();
        static LOAD(_uri: string): Promise<GLTFLoader>;
        getScene(_name?: string): Promise<GraphInstance>;
        getSceneByIndex(_iScene?: number): Promise<GraphInstance>;
        getNode(_name: string): Promise<Node>;
        getNodeByIndex(_iNode: number): Promise<Node>;
        getCamera(_name: string): Promise<ComponentCamera>;
        getCameraByIndex(_iCamera: number): Promise<ComponentCamera>;
        getAnimation(_name: string): Promise<Animation>;
        getAnimationByIndex(_iAnimation: number): Promise<Animation>;
        getMesh(_name: string): Promise<MeshGLTF>;
        getMeshByIndex(_iMesh: number): Promise<MeshGLTF>;
        getSkeleton(_name: string): Promise<SkeletonInstance>;
        getSkeletonByIndex(_iSkeleton: number): Promise<SkeletonInstance>;
        getUint8Array(_iAccessor: number): Promise<Uint8Array>;
        getUint16Array(_iAccessor: number): Promise<Uint16Array>;
        getUint32Array(_iAccessor: number): Promise<Uint32Array>;
        getFloat32Array(_iAccessor: number): Promise<Float32Array>;
        private getBufferData;
        private isSkeletalAnimation;
        private findSkeletalAnimationIndices;
        private isBoneIndex;
        private getAnimationSequenceVector3;
    }
}
declare namespace FudgeCore {
    /**
     * Static superclass for the representation of WebGl shaderprograms.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Shader {
        /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
        static readonly baseClass: typeof Shader;
        /** list of all the subclasses derived from this class, if they registered properly*/
        static readonly subclasses: typeof Shader[];
        static define: string[];
        static vertexShaderSource: string;
        static fragmentShaderSource: string;
        static program: WebGLProgram;
        static attributes: {
            [name: string]: number;
        };
        static uniforms: {
            [name: string]: WebGLUniformLocation;
        };
        /** The type of coat that can be used with this shader to create a material */
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
        static deleteProgram(this: typeof Shader): void;
        static useProgram(this: typeof Shader): void;
        static createProgram(this: typeof Shader): void;
        protected static registerSubclass(_subclass: typeof Shader): number;
        protected static insertDefines(_shader: string, _defines: string[]): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderFlat extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderFlatSkin extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderFlatTextured extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderGouraud extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderGouraudSkin extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderGouraudTextured extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderLit extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderLitTextured extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderMatCap extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderPhong extends Shader {
        static readonly iSubclass: number;
        static define: string[];
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderPick extends Shader {
        static define: string[];
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /** Code generated by CompileShaders.mjs using the information in CompileShaders.json */
    abstract class ShaderPickTextured extends Shader {
        static define: string[];
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    let shaderSources: {
        [source: string]: string;
    };
}
declare namespace FudgeCore {
    interface BoneList {
        [boneName: string]: Node;
    }
}
declare namespace FudgeCore {
    interface BoneMatrixList {
        [boneName: string]: Matrix4x4;
    }
}
declare namespace FudgeCore {
    class Skeleton extends Graph {
        readonly bones: BoneList;
        readonly mtxBindInverses: BoneMatrixList;
        /**
         * Creates a new skeleton with a name
         */
        constructor(_name?: string);
        /**
         * Appends a node to this skeleton or the given parent and registers it as a bone
         * @param _mtxInit initial local matrix
         * @param _parentName name of the parent node, that must be registered as a bone
         */
        addBone(_bone: Node, _mtxInit?: Matrix4x4, _parentName?: string): void;
        /**
         * Registers a node as a bone with its bind inverse matrix
         * @param _bone the node to be registered, that should be a descendant of this skeleton
         * @param _mtxBindInverse a precalculated inverse matrix of the bind pose from the bone
         */
        registerBone(_bone: Node, _mtxBindInverse?: Matrix4x4): void;
        /**
         * Sets the current state of this skeleton as the default pose
         * by updating the inverse bind matrices
         */
        setDefaultPose(): void;
        indexOfBone(_boneName: string): number;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        /**
         * Calculates and sets the world matrix of a bone relative to its parent
         */
        private calculateMtxWorld;
        /**
         * Deregisters all bones of a removed node
         */
        private hndChildRemove;
    }
}
declare namespace FudgeCore {
    class SkeletonInstance extends GraphInstance {
        #private;
        private skeletonSource;
        static CREATE(_skeleton: Skeleton): Promise<SkeletonInstance>;
        get bones(): BoneList;
        get mtxBoneLocals(): BoneMatrixList;
        /**
         * Gets the bone transformations for a vertex
         */
        get mtxBones(): Matrix4x4[];
        /**
         * Set this skeleton instance to be a recreation of the {@link Skeleton} given
         */
        set(_skeleton: Skeleton): Promise<void>;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        /**
         * Resets this skeleton instance to its default pose
         */
        resetPose(): void;
        applyAnimation(_mutator: Mutator): void;
        private calculateMtxBones;
        private registerBones;
    }
}
declare namespace FudgeCore {
    export enum MIPMAP {
        CRISP = 0,
        MEDIUM = 1,
        BLURRY = 2
    }
    /**
     * Baseclass for different kinds of textures.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Texture extends Mutable implements SerializableResource {
        name: string;
        idResource: string;
        mipmap: MIPMAP;
        protected renderData: {
            [key: string]: unknown;
        };
        constructor(_name?: string);
        abstract get texImageSource(): TexImageSource;
        useRenderData(): void;
        refresh(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        protected reduceMutator(_mutator: Mutator): void;
    }
    /**
     * Texture created from an existing image
     */
    export class TextureImage extends Texture {
        image: HTMLImageElement;
        url: RequestInfo;
        constructor(_url?: RequestInfo);
        get texImageSource(): TexImageSource;
        /**
         * Asynchronously loads the image from the given url
         */
        load(_url: RequestInfo): Promise<void>;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
    }
    /**
     * Texture created from a canvas
     */
    export class TextureBase64 extends Texture {
        image: HTMLImageElement;
        constructor(_name: string, _base64: string, _mipmap?: MIPMAP);
        get texImageSource(): TexImageSource;
    }
    /**
     * Texture created from a canvas
     */
    type OffscreenCanvasRenderingContext2D = General;
    export class TextureCanvas extends Texture {
        crc2: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        constructor(_name: string, _crc2: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D);
        get texImageSource(): TexImageSource;
    }
    /**
     * Texture created from a FUDGE-Sketch
     */
    export class TextureSketch extends TextureCanvas {
        get texImageSource(): TexImageSource;
    }
    /**
     * Texture created from an HTML-page
     */
    export class TextureHTML extends TextureCanvas {
        get texImageSource(): TexImageSource;
    }
    export {};
}
declare namespace FudgeCore {
    class TextureDefault extends TextureBase64 {
        static texture: TextureBase64;
        private static get;
    }
}
declare namespace FudgeCore {
    /**
     * Determines the mode a loop runs in
     */
    enum LOOP_MODE {
        /** Loop cycles controlled by window.requestAnimationFrame */
        FRAME_REQUEST = "frameRequest",
        /** Loop cycles with the given framerate in {@link Time.game} */
        TIME_GAME = "timeGame",
        /** Loop cycles with the given framerate in realtime, independent of {@link Time.game} */
        TIME_REAL = "timeReal"
    }
    /**
     * Core loop of a Fudge application. Initializes automatically and must be started explicitly.
     * It then fires {@link EVENT.LOOP_FRAME} to all added listeners at each frame
     *
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Loop extends EventTargetStatic {
        private static ƒTimeStartGame;
        private static ƒTimeStartReal;
        private static ƒTimeFrameGame;
        private static ƒTimeFrameReal;
        private static ƒTimeFrameStartGame;
        private static ƒTimeFrameStartReal;
        private static ƒTimeLastFrameGameAvg;
        private static ƒTimeLastFrameRealAvg;
        private static ƒFrames;
        private static running;
        private static mode;
        private static idIntervall;
        private static idRequest;
        private static fpsDesired;
        private static framesToAverage;
        private static syncWithAnimationFrame;
        /** The gametime the loop was started, overwritten at each start */
        static get timeStartGame(): number;
        /** The realtime the loop was started, overwritten at each start */
        static get timeStartReal(): number;
        /** The gametime elapsed since the last loop cycle */
        static get timeFrameGame(): number;
        /** The realtime elapsed since the last loop cycle */
        static get timeFrameReal(): number;
        /** The gametime the last loop cycle started*/
        static get timeFrameStartGame(): number;
        /** The realtime the last loop cycle started*/
        static get timeFrameStartReal(): number;
        /** The average number of frames per second in gametime */
        static get fpsGameAverage(): number;
        /** The average number of frames per second in realtime */
        static get fpsRealAverage(): number;
        /** The number of frames triggered so far */
        static get frames(): number;
        /**
         * Starts the loop with the given mode and fps.
         * The default for _mode is FRAME_REQUEST, see {@link LOOP_MODE}, hooking the loop to the browser's animation frame.
         * Is only applicable in TIME-modes.
         * _syncWithAnimationFrame is experimental and only applicable in TIME-modes, deferring the loop-cycle until the next possible animation frame.
         */
        static start(_mode?: LOOP_MODE, _fps?: number, _syncWithAnimationFrame?: boolean): void;
        /**
         * Stops the loop
         */
        static stop(): void;
        static continue(): void;
        private static loop;
        private static loopFrame;
        private static loopTime;
    }
}
declare namespace FudgeCore {
    interface TimeUnits {
        hours?: number;
        minutes?: number;
        seconds?: number;
        tenths?: number;
        hundreds?: number;
        thousands?: number;
        fraction?: number;
        asHours?: number;
        asMinutes?: number;
        asSeconds?: number;
    }
    interface Timers extends Object {
        [id: number]: Timer;
    }
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.
     * Supports {@link Timer}s similar to window.setInterval but with respect to the scaled time.
     * All time values are given in milliseconds
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Time extends EventTargetƒ {
        /** Standard game time starting automatically with the application */
        static readonly game: Time;
        private start;
        private scale;
        private offset;
        private lastCallToElapsed;
        private timers;
        private idTimerAddedLast;
        constructor();
        /**
         * Returns representions of the time given in milliseconds in various formats defined in {@link TimeUnits}
         */
        static getUnits(_milliseconds: number): TimeUnits;
        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         */
        get(): number;
        /**
         * Returns the remaining time to the given point of time
         */
        getRemainder(_to: number): number;
        /**
         * (Re-) Sets the timestamp of this instance
         * @param _time The timestamp to represent the current time (default 0.0)
         */
        set(_time?: number): void;
        /**
         * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1)
         * @param _scale The desired scaling (default 1.0)
         */
        setScale(_scale?: number): void;
        /**
         * Retrieves the current scaling of this time
         */
        getScale(): number;
        /**
         * Retrieves the offset of this time
         */
        getOffset(): number;
        /**
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        getElapsedSincePreviousCall(): number;
        /**
         * Returns a Promise<void> to be resolved after the time given. To be used with async/await
         */
        delay(_lapse: number): Promise<void>;
        /**
         * Stops and deletes all {@link Timer}s attached. Should be called before this Time-object leaves scope
         */
        clearAllTimers(): void;
        /**
         * Deletes {@link Timer} found using the internal id of the connected interval-object
         * @param _id
         */
        deleteTimerByItsInternalId(_id: number): void;
        /**
         * Installs a timer at this time object
         * @param _lapse The object-time to elapse between the calls to _callback
         * @param _count The number of calls desired, 0 = Infinite
         * @param _handler The function to call each the given lapse has elapsed
         * @param _arguments Additional parameters to pass to callback function
         */
        setTimer(_lapse: number, _count: number, _handler: TimerHandler, ..._arguments: Object[]): number;
        /**
         * This method is called internally by {@link Time} and {@link Timer} and must not be called otherwise
         */
        addTimer(_timer: Timer): number;
        /**
         * Deletes the timer with the id given by this time object
         */
        deleteTimer(_id: number): void;
        /**
         * Returns a reference to the timer with the given id or null if not found.
         */
        getTimer(_id: number): Timer;
        /**
         * Returns a copy of the list of timers currently installed on this time object
         */
        getTimers(): Timers;
        /**
         * Returns true if there are {@link Timers} installed to this
         */
        hasTimers(): boolean;
        /**
         * Recreates {@link Timer}s when scaling changes
         */
        private rescaleAllTimers;
    }
}
declare namespace FudgeCore {
    /**
     * Defines the signature of handler functions for {@link EventTimer}s, very similar to usual event handler
     */
    type TimerHandler = (_event: EventTimer) => void;
    /**
     * A {@link Timer}-instance internally uses window.setInterval to call a given handler with a given frequency a given number of times,
     * passing an {@link EventTimer}-instance with additional information and given arguments.
     * The frequency scales with the {@link Time}-instance the {@link Timer}-instance is attached to.
     *
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Timer {
        active: boolean;
        count: number;
        private handler;
        private time;
        private elapse;
        private event;
        private timeoutReal;
        private idWindow;
        /**
         * Creates a {@link Timer} instance.
         * @param _time The {@link Time} instance, the timer attaches to
         * @param _elapse The time in milliseconds to elapse, to the next call of _handler, measured in _time
         * @param _count The desired number of calls to _handler, Timer deinstalls automatically after last call. Passing 0 invokes infinite calls
         * @param _handler The {@link TimerHandler} instance to call
         * @param _arguments Additional arguments to pass to _handler
         *
         * TODO: for proper handling and deletion, use Time.setTimer instead of instantiating timers yourself.
         */
        constructor(_time: Time, _elapse: number, _count: number, _handler: TimerHandler, ..._arguments: Object[]);
        /**
         * Returns the window-id of the timer, which was returned by setInterval
         */
        get id(): number;
        /**
         * Returns the time-intervall for calls to the handler
         */
        get lapse(): number;
        /**
         * Attaches a copy of this at its current state to the same {@link Time}-instance. Used internally when rescaling {@link Time}
         */
        installCopy(): Timer;
        /**
         * Clears the timer, removing it from the interval-timers handled by window
         */
        clear(): void;
    }
}
