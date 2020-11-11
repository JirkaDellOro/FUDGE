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
         * Displays critical information about failures, which is emphasized e.g. by color
         */
        static fudge(_message: Object, ..._args: Object[]): void;
    }
}
declare namespace FudgeCore {
    /**
     * The Debug-Class offers functions known from the console-object and additions,
     * routing the information to various [[DebugTargets]] that can be easily defined by the developers and registerd by users
     * Override functions in subclasses of [[DebugTarget]] and register them as their delegates
     */
    class Debug {
        /**
         * For each set filter, this associative array keeps references to the registered delegate functions of the chosen [[DebugTargets]]
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
        [eventType: string]: EventListener[];
    }
    /**
     * Types of events specific to Fudge, in addition to the standard DOM/Browser-Types and custom strings
     */
    const enum EVENT {
        /** dispatched to targets registered at [[Loop]], when requested animation frame starts */
        LOOP_FRAME = "loopFrame",
        /** dispatched to a [[Component]] when its being added to a [[Node]] */
        COMPONENT_ADD = "componentAdd",
        /** dispatched to a [[Component]] when its being removed from a [[Node]] */
        COMPONENT_REMOVE = "componentRemove",
        /** dispatched to a [[Component]] when its being activated */
        COMPONENT_ACTIVATE = "componentActivate",
        /** dispatched to a [[Component]] when its being deactivated */
        COMPONENT_DEACTIVATE = "componentDeactivate",
        /** dispatched to a child [[Node]] and its ancestors after it was appended to a parent */
        CHILD_APPEND = "childAppend",
        /** dispatched to a child [[Node]] and its ancestors just before its being removed from its parent */
        CHILD_REMOVE = "childRemove",
        /** dispatched to a [[Mutable]] when its being mutated */
        MUTATE = "mutate",
        /** dispatched to [[Viewport]] when it gets the focus to receive keyboard input */
        FOCUS_IN = "focusin",
        /** dispatched to [[Viewport]] when it loses the focus to receive keyboard input */
        FOCUS_OUT = "focusout",
        /** dispatched to [[Node]] when it's done serializing */
        NODE_SERIALIZED = "nodeSerialized",
        /** dispatched to [[Node]] when it's done deserializing, so all components, children and attributes are available */
        NODE_DESERIALIZED = "nodeDeserialized",
        /** dispatched to [[GraphInstance]] when it's content is set according to a serialization of a [[Graph]]  */
        GRAPH_INSTANTIATED = "graphInstantiated",
        /** dispatched to [[Time]] when it's scaling changed  */
        TIME_SCALED = "timeScaled",
        /** dispatched to [[FileIo]] when a list of files has been loaded  */
        FILE_LOADED = "fileLoaded",
        /** dispatched to [[FileIo]] when a list of files has been saved */
        FILE_SAVED = "fileSaved"
    }
    type Eventƒ = EventPointer | EventDragDrop | EventWheel | EventKeyboard | Event;
    type EventListenerƒ = ((_event: EventPointer) => void) | ((_event: EventDragDrop) => void) | ((_event: EventWheel) => void) | ((_event: EventKeyboard) => void) | ((_event: Eventƒ) => void) | EventListenerObject;
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
     * Base class for all types being mutable using [[Mutator]]-objects, thus providing and using interfaces created at runtime.
     * Mutables provide a [[Mutator]] that is build by collecting all object-properties that are either of a primitive type or again Mutable.
     * Subclasses can either reduce the standard [[Mutator]] built by this base class by deleting properties or implement an individual getMutator-method.
     * The provided properties of the [[Mutator]] must match public properties or getters/setters of the object.
     * Otherwise, they will be ignored if not handled by an override of the mutate-method in the subclass and throw errors in an automatically generated user-interface for the object.
     */
    abstract class Mutable extends EventTargetƒ {
        /**
         * Decorator allows to attach [[Mutable]] functionality to existing classes.
         */
        /**
         * Retrieves the type of this mutable subclass as the name of the runtime class
         * @returns The type of the mutable
         */
        get type(): string;
        /**
         * Collect applicable attributes of the instance and copies of their values in a Mutator-object.
         * By default, a mutator cannot extended, since extensions are not available in the object the mutator belongs to.
         * A mutator may be reduced by the descendants of [[Mutable]] to contain only the properties needed.
         */
        getMutator(_extendable?: boolean): Mutator;
        /**
         * Collect the attributes of the instance and their values applicable for animation.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForAnimation(): MutatorForAnimation;
        /**
         * Collect the attributes of the instance and their values applicable for the user interface.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForUserInterface(): MutatorForUserInterface;
        /**
         * Collect the attributes of the instance and their values applicable for indiviualization by the component.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * Does not recurse into objects!
         * @param _mutator
         */
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator
         */
        updateMutator(_mutator: Mutator): void;
        /**
         * Updates the attribute values of the instance according to the state of the mutator. Must be protected...!
         * @param _mutator
         */
        mutate(_mutator: Mutator): Promise<void>;
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
    abstract class Serializer {
        /** In order for the Serializer to create class instances, it needs access to the appropriate namespaces */
        private static namespaces;
        /**
         * Registers a namespace to the [[Serializer]], to enable automatic instantiation of classes defined within
         * @param _namespace
         */
        static registerNamespace(_namespace: Object): string;
        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the [[Serializable]] interface
         */
        static serialize(_object: Serializable): Serialization;
        /**
         * Returns a FUDGE-object reconstructed from the information in the [[Serialization]] given,
         * including attached components, children, superclass-objects
         * @param _serialization
         */
        static deserialize(_serialization: Serialization): Promise<Serializable>;
        static prettify(_json: string): string;
        /**
         * Returns a formatted, human readable JSON-String, representing the given [[Serializaion]] that may have been created by [[Serializer]].serialize
         * @param _serialization
         */
        static stringify(_serialization: Serialization): string;
        /**
         * Returns a [[Serialization]] created from the given JSON-String. Result may be passed to [[Serializer]].deserialize
         * @param _json
         */
        static parse(_json: string): Serialization;
        /**
         * Creates an object of the class defined with the full path including the namespaceName(s) and the className seperated by dots(.)
         * @param _path
         */
        static reconstruct(_path: string): Serializable;
        static getConstructor<T extends Serializable>(_type: string, _namespace?: Object): new () => T;
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
        protected static injectCoatColored(this: Coat, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
        protected static injectCoatTextured(this: Coat, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
        protected static injectCoatMatCap(this: Coat, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
    }
}
declare namespace FudgeCore {
    interface RenderBuffers {
        vertices: WebGLBuffer;
        indices: WebGLBuffer;
        nIndices: number;
        textureUVs: WebGLBuffer;
        normalsFace: WebGLBuffer;
    }
    class RenderInjectorMesh {
        static decorate(_constructor: Function): void;
        protected static createRenderBuffers(this: Mesh): void;
        protected static useRenderBuffers(this: Mesh, _shader: typeof Shader, _world: Matrix4x4, _projection: Matrix4x4, _id?: number): void;
        protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void;
    }
}
declare namespace FudgeCore {
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.
     * Using [[Recycler]] reduces load on the carbage collector and thus supports smooth performance
     */
    abstract class Recycler {
        private static depot;
        /**
         * Fetches an object of the requested type from the depot, or returns a new one, if the depot was empty
         * @param _T The class identifier of the desired object
         */
        static get<T>(_T: new () => T): T;
        /**
         * Returns a reference to an object of the requested type in the depot, but does not remove it there.
         * If no object of the requested type was in the depot, one is created, stored and borrowed.
         * For short term usage of objects in a local scope, when there will be no other call to Recycler.get or .borrow!
         * @param _T The class identifier of the desired object
         */
        static borrow<T>(_T: new () => T): T;
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
    class Vector2 extends Mutable {
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
        static TRANSFORMATION(_vector: Vector2, _matrix: Matrix3x3, _includeTranslation?: boolean): Vector2;
        /**
         * Normalizes a given vector to the given length without editing the original vector.
         * @param _vector the vector to normalize
         * @param _length the length of the resulting vector. defaults to 1
         * @returns a new vector representing the normalised vector scaled by the given length
         */
        static NORMALIZATION(_vector: Vector2, _length?: number): Vector2;
        /**
         * Scales a given vector by a given scale without changing the original vector
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static SCALE(_vector: Vector2, _scale: number): Vector2;
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors: Vector2[]): Vector2;
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a: Vector2, _b: Vector2): Vector2;
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a: Vector2, _b: Vector2): number;
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSSPRODUCT(_a: Vector2, _b: Vector2): number;
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
         */
        get copy(): Vector2;
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
         * Scales the Vector by the _scale.
         * @param _scale The scale to multiply the vector with.
         */
        scale(_scale: number): void;
        /**
         * Normalizes the vector.
         * @param _length A modificator to get a different length of normalized vector.
         */
        normalize(_length?: number): void;
        /**
         * Sets the Vector to the given parameters. Ommitted parameters default to 0.
         * @param _x new x to set
         * @param _y new y to set
         */
        set(_x?: number, _y?: number): void;
        /**
         * @returns An array of the data of the vector
         */
        get(): Float32Array;
        transform(_matrix: Matrix3x3, _includeTranslation?: boolean): void;
        /**
         * Adds a z-component of the given magnitude (default=0) to the vector and returns a new Vector3
         */
        toVector3(_z?: number): Vector3;
        toString(): string;
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
    class Rectangle extends Mutable {
        position: Vector2;
        size: Vector2;
        constructor(_x?: number, _y?: number, _width?: number, _height?: number, _origin?: ORIGIN2D);
        /**
         * Returns a new rectangle created with the given parameters
         */
        static GET(_x?: number, _y?: number, _width?: number, _height?: number, _origin?: ORIGIN2D): Rectangle;
        /**
         * Sets the position and size of the rectangle according to the given parameters
         */
        setPositionAndSize(_x?: number, _y?: number, _width?: number, _height?: number, _origin?: ORIGIN2D): void;
        pointToRect(_point: Vector2, _target: Rectangle): Vector2;
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
        get copy(): Rectangle;
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
         * Creates a string representation of this rectangle
         */
        toString(): string;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    let fudgeConfig: General;
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
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    abstract class RenderOperator {
        protected static crc3: WebGL2RenderingContext;
        private static rectViewport;
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
         * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
         */
        static initialize(_antialias?: boolean, _alpha?: boolean): WebGL2RenderingContext;
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
        static setViewportRectangle(_rect: Rectangle): void;
        /**
         * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
         */
        static getViewportRectangle(): Rectangle;
        static setDepthTest(_test: boolean): void;
        static setBlendMode(_mode: BLEND): void;
        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         */
        protected static draw(_mesh: Mesh, cmpMaterial: ComponentMaterial, _final: Matrix4x4, _projection: Matrix4x4): void;
    }
}
declare namespace FudgeCore {
    class RenderInjectorTexture extends RenderInjector {
        static decorate(_constructor: Function): void;
        protected static injectTextureImage(this: Texture): void;
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
        name: string;
        readonly mtxWorld: Matrix4x4;
        timestampUpdate: number;
        private parent;
        private children;
        private components;
        private listeners;
        private captures;
        private active;
        private worldInverseUpdated;
        private worldInverse;
        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        constructor(_name: string);
        get isActive(): boolean;
        /**
         * Shortcut to retrieve this nodes [[ComponentTransform]]
         */
        get cmpTransform(): ComponentTransform;
        /**
         * Shortcut to retrieve the local [[Matrix4x4]] attached to this nodes [[ComponentTransform]]
         * Fails if no [[ComponentTransform]] is attached
         */
        get mtxLocal(): Matrix4x4;
        get mtxWorldInverse(): Matrix4x4;
        /**
         * Returns the number of children attached to this
         */
        get nChildren(): number;
        /**
         * Generator yielding the node and all decendants in the graph below for iteration
         */
        get graph(): IterableIterator<Node>;
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
         * Simply calls [[addChild]]. This reference is here solely because appendChild is the equivalent method in DOM.
         * See and preferably use [[addChild]]
         */
        readonly appendChild: (_child: Node) => void;
        /**
         * Adds the given reference to a node to the list of children, if not already in
         * @throws Error when trying to add an ancestor of this
         */
        addChild(_child: Node): void;
        /**
         * Removes the reference to the give node from the list of children
         * @param _child The node to be removed.
         */
        removeChild(_child: Node): void;
        /**
         * Removes all references in the list of children
         */
        removeAllChildren(): void;
        /**
         * Returns the position of the node in the list of children or -1 if not found
         * @param _search The node to be found.
         */
        findChild(_search: Node): number;
        /**
         * Replaces a child node with another, preserving the position in the list of children
         * @param _replace The node to be replaced
         * @param _with The node to replace with
         */
        replaceChild(_replace: Node, _with: Node): boolean;
        isUpdated(_timestampUpdate: number): boolean;
        isDescendantOf(_ancestor: Node): boolean;
        /**
         * Applies a Mutator from [[Animation]] to all its components and transfers it to its children.
         * @param _mutator The mutator generated from an [[Animation]]
         */
        applyAnimation(_mutator: Mutator): void;
        /**
         * Returns a list of all components attached to this node, independent of type.
         */
        getAllComponents(): Component[];
        /**
         * Returns a clone of the list of components of the given class attached to this node.
         * @param _class The class of the components to be found.
         */
        getComponents<T extends Component>(_class: new () => T): T[];
        /**
         * Returns the first compontent found of the given class attached this node or null, if list is empty or doesn't exist
         * @param _class The class of the components to be found.
         */
        getComponent<T extends Component>(_class: new () => T): T;
        /**
         * Adds the supplied component into the nodes component map.
         * @param _component The component to be pushed into the array.
         */
        addComponent(_component: Component): void;
        /**
         * Removes the given component from the node, if it was attached, and sets its parent to null.
         * @param _component The component to be removed
         * @throws Exception when component is not found
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
         * @param _type The type of the event, should be an enumerated value of NODE_EVENT, can be any string
         * @param _handler The function to call when the event reaches this node
         * @param _capture When true, the listener listens in the capture phase, when the event travels deeper into the hierarchy of nodes.
         */
        addEventListener(_type: EVENT | string, _handler: EventListener, _capture?: boolean): void;
        /**
         * Removes an event listener from the node. The signatur must match the one used with addEventListener
         * @param _type The type of the event, should be an enumerated value of NODE_EVENT, can be any string
         * @param _handler The function to call when the event reaches this node
         * @param _capture When true, the listener listens in the capture phase, when the event travels deeper into the hierarchy of nodes.
         */
        removeEventListener(_type: EVENT | string, _handler: EventListener, _capture?: boolean): void;
        /**
         * Dispatches a synthetic event to target. This implementation always returns true (standard: return true only if either event's cancelable attribute value is false or its preventDefault() method was not invoked)
         * The event travels into the hierarchy to this node dispatching the event, invoking matching handlers of the nodes ancestors listening to the capture phase,
         * than the matching handler of the target node in the target phase, and back out of the hierarchy in the bubbling phase, invoking appropriate handlers of the anvestors
         * @param _event The event to dispatch
         */
        dispatchEvent(_event: Event): boolean;
        /**
         * Broadcasts a synthetic event to this node and from there to all nodes deeper in the hierarchy,
         * invoking matching handlers of the nodes listening to the capture phase. Watch performance when there are many nodes involved
         * @param _event The event to broadcast
         */
        broadcastEvent(_event: Event): void;
        private broadcastEventRecursive;
        private getGraphGenerator;
    }
}
declare namespace FudgeCore {
    /**
     * Holds information about the AnimationStructure that the Animation uses to map the Sequences to the Attributes.
     * Built out of a [[Node]]'s serialsation, it swaps the values with [[AnimationSequence]]s.
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
     * Animation Class to hold all required Objects that are part of an Animation.
     * Also holds functions to play said Animation.
     * Can be added to a Node and played through [[ComponentAnimator]].
     * @author Lukas Scheuerle, HFU, 2019
     */
    class Animation extends Mutable implements SerializableResource {
        idResource: string;
        name: string;
        totalTime: number;
        labels: AnimationLabel;
        stepsPerSecond: number;
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
         * Generates a new "Mutator" with the information to apply to the [[Node]] the [[ComponentAnimator]] is attached to with [[Node.applyAnimation()]].
         * @param _time The time at which the animation currently is at
         * @param _direction The direction in which the animation is supposed to be playing back. >0 == forward, 0 == stop, <0 == backwards
         * @param _playback The playbackmode the animation is supposed to be calculated with.
         * @returns a "Mutator" to apply.
         */
        getMutated(_time: number, _direction: number, _playback: ANIMATION_PLAYBACK): Mutator;
        /**
         * Returns a list of the names of the events the [[ComponentAnimator]] needs to fire between _min and _max.
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
         * Ensures the existance of the requested [[AnimationStrcuture]] and returns it.
         * @param _type the type of the structure to get
         * @returns the requested [[AnimationStructure]]
         */
        private getProcessedAnimationStructure;
        /**
         * Ensures the existance of the requested [[AnimationEventTrigger]] and returns it.
         * @param _type The type of AnimationEventTrigger to get
         * @returns the requested [[AnimationEventTrigger]]
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
         * Creates a rastered [[AnimationSequence]] out of a given sequence.
         * @param _sequence The sequence to calculate the new sequence out of
         * @returns the rastered sequence.
         */
        private calculateRasteredSequence;
        /**
         * Creates a new reversed [[AnimationEventTrigger]] object based on the given one.
         * @param _events the event object to calculate the new one out of
         * @returns the reversed event object
         */
        private calculateReverseEventTriggers;
        /**
         * Creates a rastered [[AnimationEventTrigger]] object based on the given one.
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
     * Calculates the values between [[AnimationKey]]s.
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
     * Also holds a reference to the [[AnimationFunction]]s that come in and out of the sides. The [[AnimationFunction]]s are handled by the [[AnimationSequence]]s.
     * Saved inside an [[AnimationSequence]].
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
     * A sequence of [[AnimationKey]]s that is mapped to an attribute of a [[Node]] or its [[Component]]s inside the [[Animation]].
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
     * Extension of AudioBuffer with a load method that creates a buffer in the [[AudioManager]].default to be used with [[ComponentAudio]]
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
         * Determines FUDGE-graph to listen to. Each [[ComponentAudio]] in the graph will connect to this contexts master gain, all others disconnect.
         */
        listenTo: (_graph: Node | null) => void;
        /**
         * Retrieve the FUDGE-graph currently listening to
         */
        getGraphListeningTo: () => Node;
        /**
         * Set the [[ComponentAudioListener]] that serves the spatial location and orientation for this contexts listener
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
     * Holds data to feed into a [[Shader]] to describe the surface of [[Mesh]].
     * [[Material]]s reference [[Coat]] and [[Shader]].
     * The method useRenderData will be injected by [[RenderInjector]] at runtime, extending the functionality of this class to deal with the renderer.
     */
    class Coat extends Mutable implements Serializable {
        name: string;
        protected renderData: {
            [key: string]: unknown;
        };
        useRenderData(_shader: typeof Shader, _cmpMaterial: ComponentMaterial): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(): void;
    }
    /**
     * The simplest [[Coat]] providing just a color
     */
    class CoatColored extends Coat {
        color: Color;
        constructor(_color?: Color);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
    /**
     * A [[Coat]] to be used by the MatCap Shader providing a texture, a tint color (0.5 grey is neutral). Set shadeSmooth to 1 for smooth shading.
     */
    class CoatMatCap extends Coat {
        texture: TextureImage;
        color: Color;
        shadeSmooth: number;
        constructor(_texture?: TextureImage, _color?: Color, _shadeSmooth?: number);
    }
}
declare namespace FudgeCore {
    /**
     * A [[Coat]] providing a texture and additional data for texturing
     */
    class CoatTextured extends CoatColored {
        texture: TextureImage;
        constructor(_color?: Color, _texture?: TextureImage);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2020 | Jascha Karagöl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
     */
    abstract class Component extends Mutable implements Serializable {
        /** subclasses get a iSubclass number for identification */
        static readonly iSubclass: number;
        /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
        static readonly baseClass: typeof Component;
        /** list of all the subclasses derived from this class, if they registered properly*/
        static readonly subclasses: typeof Component[];
        protected singleton: boolean;
        private container;
        private active;
        protected static registerSubclass(_subclass: typeof Component): number;
        get isActive(): boolean;
        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        get isSingleton(): boolean;
        activate(_on: boolean): void;
        /**
         * Retrieves the node, this component is currently attached to
         * @returns The container node or null, if the component is not attached to
         */
        getContainer(): Node | null;
        /**
         * Tries to add the component to the given node, removing it from the previous container if applicable
         * @param _container The node to attach this component to
         */
        setContainer(_container: Node | null): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
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
        /**Uses the FPS value of the animation to advance once per frame, no matter the speed of the frames. Doesn't skip any frames.*/
        FRAMEBASED = 2
    }
    /**
     * Holds a reference to an [[Animation]] and controls it. Controls playback and playmode as well as speed.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class ComponentAnimator extends Component {
        static readonly iSubclass: number;
        animation: Animation;
        playmode: ANIMATION_PLAYMODE;
        playback: ANIMATION_PLAYBACK;
        speedScalesWithGlobalSpeed: boolean;
        private localTime;
        private speedScale;
        private lastTime;
        constructor(_animation?: Animation, _playmode?: ANIMATION_PLAYMODE, _playback?: ANIMATION_PLAYBACK);
        set speed(_s: number);
        /**
         * Jumps to a certain time in the animation to play from there.
         * @param _time The time to jump to
         */
        jumpTo(_time: number): void;
        /**
         * Returns the current time of the animation, modulated for animation length.
         */
        getCurrentTime(): number;
        /**
         * Forces an update of the animation from outside. Used in the ViewAnimation. Shouldn't be used during the game.
         * @param _time the (unscaled) time to update the animation with.
         * @returns a Tupel containing the Mutator for Animation and the playmode corrected time.
         */
        updateAnimation(_time: number): [Mutator, number];
        serialize(): Serialization;
        deserialize(_s: Serialization): Promise<Serializable>;
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
         * Calculates the actual time to use, using the current playmodes.
         * @param _time the time to apply the playmodes to
         * @returns the recalculated time
         */
        private applyPlaymodes;
        /**
         * Calculates and returns the direction the animation should currently be playing in.
         * @param _time the time at which to calculate the direction
         * @returns 1 if forward, 0 if stop, -1 if backwards
         */
        private calculateDirection;
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
     * Builds a minimal audio graph (by default in [[AudioManager]].default) and synchronizes it with the containing [[Node]]
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
        /** places and directs the panner relative to the world transform of the [[Node]]  */
        pivot: Matrix4x4;
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
        get isPlaying(): boolean;
        get isAttached(): boolean;
        get isListened(): boolean;
        setAudio(_audio: Audio): void;
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
         * Inserts AudioNodes between the panner and the local gain of this [[ComponentAudio]]
         * _input and _output may be the same AudioNode, if there is only one to insert,
         * or may have multiple AudioNode between them to create an effect-graph.\
         * Note that [[ComponentAudio]] does not keep track of inserted AudioNodes!
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
         * Only call this method if the component is not attached to a [[Node]] but needs to be heard.
         */
        connect(_on: boolean): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        private hndAudioReady;
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
     * world transform of the [[Node]] it is attached to.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentAudioListener extends Component {
        static readonly iSubclass: number;
        pivot: Matrix4x4;
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
        static readonly iSubclass: number;
        pivot: Matrix4x4;
        backgroundColor: Color;
        private projection;
        private transform;
        private fieldOfView;
        private aspectRatio;
        private direction;
        private near;
        private far;
        private backgroundEnabled;
        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        get ViewProjectionMatrix(): Matrix4x4;
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
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvas.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left?: number, _right?: number, _bottom?: number, _top?: number): void;
        /**
         * Return the calculated normed dimension of the projection surface, that is in the hypothetical distance of 1 to the camera
         */
        getProjectionRectangle(): Rectangle;
        project(_pointInWorldSpace: Vector3): Vector3;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        mutate(_mutator: Mutator): Promise<void>;
        protected reduceMutator(_mutator: Mutator): void;
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
     * ```plaintext
     * ~ ~ ~
     *  ~ ~ ~
     * ```
     */
    class LightAmbient extends Light {
        constructor(_color?: Color);
    }
    /**
     * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)
     * ```plaintext
     * --->
     * --->
     * --->
     * ```
     */
    class LightDirectional extends Light {
        constructor(_color?: Color);
    }
    /**
     * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)
     * ```plaintext
     *         .\|/.
     *        -- o --
     *         ´/|\`
     * ```
     */
    class LightPoint extends Light {
        range: number;
    }
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
}
declare namespace FudgeCore {
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    /**
     * Defines identifiers for the various types of light this component can provide.
     */
    enum LIGHT_TYPE {
        AMBIENT = "LightAmbient",
        DIRECTIONAL = "LightDirectional",
        POINT = "LightPoint",
        SPOT = "LightSpot"
    }
    class ComponentLight extends Component {
        static readonly iSubclass: number;
        pivot: Matrix4x4;
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
     * Attaches a [[Material]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMaterial extends Component {
        static readonly iSubclass: number;
        material: Material;
        clrPrimary: Color;
        clrSecondary: Color;
        pivot: Matrix3x3;
        constructor(_material?: Material);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * Attaches a [[Mesh]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends Component {
        static readonly iSubclass: number;
        pivot: Matrix4x4;
        mesh: Mesh;
        constructor(_mesh?: Mesh);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        getMutatorForUserInterface(): MutatorForUserInterface;
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
     * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends Component {
        static readonly iSubclass: number;
        local: Matrix4x4;
        constructor(_matrix?: Matrix4x4);
        /**
         * Adjusts the rotation to point the z-axis directly at the given target point in world space and tilts it to accord with the given up vector,
         * respectively calculating yaw and pitch. If no up vector is given, the previous up-vector is used.
         */
        lookAt(_targetWorld: Vector3, _up?: Vector3): void;
        /**
         * Adjusts the rotation to match its y-axis with the given up-vector and facing its z-axis toward the given target at minimal angle,
         * respectively calculating yaw only. If no up vector is given, the previous up-vector is used.
         */
        showTo(_targetWorld: Vector3, _up?: Vector3): void;
        /**
         * recalculates this local matrix to yield the identical world matrix based on the given node.
         * Use rebase before appending the container of this component to another node while preserving its transformation in the world.
         */
        rebase(_node?: Node): void;
        /**
         * Applies the given transformation relative to the selected base (SELF, PARENT, WORLD) or a particular other node (NODE)
         */
        transform(_transform: Matrix4x4, _base?: BASE, _node?: Node): void;
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
        constructor(_name: string, _factor?: number, _type?: CONTROL_TYPE, _active?: boolean);
        /**
         * Set the time-object to be used when calculating the output in [[CONTROL_TYPE.INTEGRAL]]
         */
        setTimebase(_time: Time): void;
        /**
         * Feed an input value into this control and fire the events [[EVENT_CONTROL.INPUT]] and [[EVENT_CONTROL.OUTPUT]]
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
         * Set the factor to multiply the input value given with [[setInput]] with
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
        private getValueDelayed;
        private dispatchOutput;
    }
}
declare namespace FudgeCore {
    /**
     * Handles multiple controls as inputs and creates an output from that.
     * As a subclass of [[Control]], axis calculates the ouput summing up the inputs and processing the result using its own settings.
     * Dispatches [[EVENT_CONTROL.OUTPUT]] and [[EVENT_CONTROL.INPUT]] when one of the controls dispatches them.
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
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material extends Mutable implements SerializableResource {
        /** The name to call the Material by. */
        name: string;
        idResource: string;
        private shaderType;
        private coat;
        constructor(_name: string, _shader?: typeof Shader, _coat?: Coat);
        /**
         * Creates a new [[Coat]] instance that is valid for the [[Shader]] referenced by this material
         */
        createCoatMatchingShader(): Coat;
        /**
         * Makes this material reference the given [[Coat]] if it is compatible with the referenced [[Shader]]
         * @param _coat
         */
        setCoat(_coat: Coat): void;
        /**
         * Returns the currently referenced [[Coat]] instance
         */
        getCoat(): Coat;
        /**
         * Changes the materials reference to the given [[Shader]], creates and references a new [[Coat]] instance
         * and mutates the new coat to preserve matching properties.
         * @param _shaderType
         */
        setShader(_shaderType: typeof Shader): void;
        /**
         * Returns the [[Shader]] referenced by this material
         */
        getShader(): typeof Shader;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    enum MODE {
        EDITOR = 0,
        RUNTIME = 1
    }
    interface SerializableResource extends Serializable {
        name: string;
        type: string;
        idResource: string;
    }
    interface Resources {
        [idResource: string]: SerializableResource;
    }
    interface SerializationOfResources {
        [idResource: string]: Serialization;
    }
    interface ScriptNamespaces {
        [name: string]: Object;
    }
    interface ComponentScripts {
        [namespace: string]: ComponentScript[];
    }
    /**
     * Static class handling the resources used with the current FUDGE-instance.
     * Keeps a list of the resources and generates ids to retrieve them.
     * Resources are objects referenced multiple times but supposed to be stored only once
     */
    abstract class Project {
        static resources: Resources;
        static serialization: SerializationOfResources;
        static scriptNamespaces: ScriptNamespaces;
        static baseURL: URL;
        static mode: MODE;
        /**
         * Registers the resource and generates an id for it by default.
         * If the resource already has an id, thus having been registered, its deleted from the list and registered anew.
         * It's possible to pass an id, but should not be done except by the Serializer.
         */
        static register(_resource: SerializableResource, _idResource?: string): void;
        static deregister(_resource: SerializableResource): void;
        static clear(): void;
        static getResourcesOfType<T>(_type: new (_args: General) => T): Resources;
        /**
         * Generate a user readable and unique id using the type of the resource, the date and random numbers
         * @param _resource
         */
        static generateId(_resource: SerializableResource): string;
        /**
         * Tests, if an object is a [[SerializableResource]]
         * @param _object The object to examine
         */
        static isResource(_object: Serializable): boolean;
        /**
         * Retrieves the resource stored with the given id
         */
        static getResource(_idResource: string): Promise<SerializableResource>;
        /**
         * Creates and registers a resource from a [[Node]], copying the complete graph starting with it
         * @param _node A node to create the resource from
         * @param _replaceWithInstance if true (default), the node used as origin is replaced by a [[GraphInstance]] of the [[Graph]] created
         */
        static registerAsGraph(_node: Node, _replaceWithInstance?: boolean): Promise<Graph>;
        static createGraphInstance(_graph: Graph): Promise<GraphInstance>;
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
}
declare namespace FudgeCore {
    /**
     * Controls the rendering of a graph, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[Framing]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Viewport extends EventTargetƒ {
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
        private graph;
        private crc2;
        private canvas;
        private pickBuffers;
        /**
         * Returns true if this viewport currently has focus and thus receives keyboard events
         */
        get hasFocus(): boolean;
        /**
         * Connects the viewport to the given canvas to render the given graph to using the given camera-component, and names the viewport as given.
         */
        initialize(_name: string, _graph: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void;
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
         * Set the graph to be drawn in the viewport.
         */
        setGraph(_graph: Node): void;
        getGraph(): Node;
        /**
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph(): void;
        /**
         * Draw this viewport
         */
        draw(): void;
        /**
        * Draw this viewport for RayCast
        */
        createPickBuffers(): void;
        pickNodeAt(_pos: Vector2): RayHit[];
        /**
         * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
         */
        adjustFrames(): void;
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        adjustCamera(): void;
        /**
         * Returns a [[Ray]] in world coordinates from this camera through the point given in client space
         */
        getRayFromClient(_point: Vector2): Ray;
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
         * Returns a point in normed view-rectangle matching the given point on the client rectangle
         * The view-rectangle matches the client size in the hypothetical distance of 1 to the camera, its origin in the center and y-axis pointing up
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
        pointClientToScreen(_client: Vector2): Vector2;
        /**
         * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events.
         * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire [[Event]]s accordingly.
         * // TODO: examine, if this can be achieved by regular DOM-Focus and tabindex=0
         * @param _on
         */
        setFocus(_on: boolean): void;
        /**
         * De- / Activates the given pointer event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activatePointerEvent(_type: EVENT_POINTER, _on: boolean): void;
        /**
         * De- / Activates the given keyboard event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateKeyboardEvent(_type: EVENT_KEYBOARD, _on: boolean): void;
        /**
         * De- / Activates the given drag-drop event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateDragDropEvent(_type: EVENT_DRAGDROP, _on: boolean): void;
        /**
         * De- / Activates the wheel event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateWheelEvent(_type: EVENT_WHEEL, _on: boolean): void;
        /**
         * Handle drag-drop events and dispatch to viewport as FUDGE-Event
         */
        private hndDragDropEvent;
        /**
         * Add position of the pointer mapped to canvas-coordinates as canvasX, canvasY to the event
         * @param event
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
    const enum EVENT_AUDIO {
        /** broadcast to a [[Node]] and all its descendants in the graph after it was appended to a parent */
        CHILD_APPEND = "childAppendToAudioGraph",
        /** broadcast to a [[Node]] and all its descendants in the graph just before its being removed from its parent */
        CHILD_REMOVE = "childRemoveFromAudioGraph",
        /** broadcast to a [[Node]] and all its descendants in the graph to update the panners in AudioComponents */
        UPDATE = "updateAudioGraph",
        READY = "ready"
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
    class EventTimer {
        type: EVENT_TIMER;
        target: Timer;
        arguments: Object[];
        firstCall: boolean;
        lastCall: boolean;
        constructor(_timer: Timer, ..._arguments: Object[]);
    }
}
declare namespace FudgeCore {
    const enum EVENT_WHEEL {
        WHEEL = "\u0192wheel"
    }
    class EventWheel extends WheelEvent {
        constructor(type: string, _event: EventWheel);
    }
}
declare namespace FudgeCore {
    /**
     * A node managed by [[Project]] that functions as a template for [[GraphInstance]]s
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
     */
    class Graph extends Node implements SerializableResource {
        idResource: string;
        type: string;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
    }
}
declare namespace FudgeCore {
    /**
     * An instance of a [[Graph]].
     * This node keeps a reference to its resource an can thus optimize serialization
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     * @link https://github.com/JirkaDellOro/FUDGE/wiki/Resource
     */
    class GraphInstance extends Node {
        /** id of the resource that instance was created from */
        private idSource;
        constructor(_graph?: Graph);
        /**
         * Recreate this node from the [[Graph]] referenced
         */
        reset(): Promise<void>;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        /**
         * Set this node to be a recreation of the [[Graph]] given
         */
        set(_graph: Graph): Promise<void>;
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
     * Simple class for 3x3 matrix operations
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class Matrix3x3 extends Mutable implements Serializable {
        private data;
        private mutator;
        private vectors;
        constructor();
        static PROJECTION(_width: number, _height: number): Matrix3x3;
        static IDENTITY(): Matrix3x3;
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
         */
        static TRANSLATION(_translate: Vector2): Matrix3x3;
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION(_angleInDegrees: number): Matrix3x3;
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given vector
         */
        static SCALING(_scalar: Vector2): Matrix3x3;
        static MULTIPLICATION(_a: Matrix3x3, _b: Matrix3x3): Matrix3x3;
        /**
         * - get: a copy of the calculated translation vector
         * - set: effect the matrix ignoring its rotation and scaling
         */
        get translation(): Vector2;
        set translation(_translation: Vector2);
        /**
         * - get: a copy of the calculated rotation vector
         * - set: effect the matrix
         */
        get rotation(): number;
        set rotation(_rotation: number);
        /**
         * - get: a copy of the calculated scale vector
         * - set: effect the matrix
         */
        get scaling(): Vector2;
        set scaling(_scaling: Vector2);
        /**
         * Return a copy of this
         */
        get copy(): Matrix3x3;
        /**
         * Add a translation by the given vector to this matrix
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
         * Add a scaling by the given vector to this matrix
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
        multiply(_matrix: Matrix3x3): void;
        /**
         * Calculates and returns the euler-angles representing the current rotation of this matrix
         */
        getEulerAngles(): number;
        /**
         * Sets the elements of this matrix to the values of the given matrix
         */
        set(_to: Matrix3x3): void;
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
    class Matrix4x4 extends Mutable implements Serializable {
        private data;
        private mutator;
        private vectors;
        constructor();
        /**
         * - get: a copy of the calculated translation vector
         * - set: effect the matrix ignoring its rotation and scaling
         */
        get translation(): Vector3;
        set translation(_translation: Vector3);
        /**
         * - get: a copy of the calculated rotation vector
         * - set: effect the matrix
         */
        get rotation(): Vector3;
        set rotation(_rotation: Vector3);
        /**
         * - get: a copy of the calculated scale vector
         * - set: effect the matrix
         */
        get scaling(): Vector3;
        set scaling(_scaling: Vector3);
        /**
         * Retrieve a new identity matrix
         */
        static IDENTITY(): Matrix4x4;
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static MULTIPLICATION(_a: Matrix4x4, _b: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _matrix The matrix to compute the inverse of.
         */
        static INVERSION(_matrix: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns a matrix with the given translation, its z-axis pointing directly at the given target,
         * and a minimal angle between its y-axis and the given up-Vector, respetively calculating yaw and pitch.
         */
        static LOOK_AT(_translation: Vector3, _target: Vector3, _up?: Vector3): Matrix4x4;
        /**
         * Computes and returns a matrix with the given translation, its y-axis matching the given up-vector
         * and its z-axis facing towards the given target at a minimal angle, respetively calculating yaw only.
         */
        static SHOW_TO(_translation: Vector3, _target: Vector3, _up?: Vector3): Matrix4x4;
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
         */
        static TRANSLATION(_translate: Vector3): Matrix4x4;
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_X(_angleInDegrees: number): Matrix4x4;
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_Y(_angleInDegrees: number): Matrix4x4;
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_Z(_angleInDegrees: number): Matrix4x4;
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given vector
         */
        static SCALING(_scalar: Vector3): Matrix4x4;
        /**
         * Returns a representation of the given matrix relative to the given base.
         * If known, pass the inverse of the base to avoid unneccesary calculation
         */
        static RELATIVE(_matrix: Matrix4x4, _base: Matrix4x4, _inverse?: Matrix4x4): Matrix4x4;
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
         * Rotate this matrix by given vector in the order Z, Y, X. Right hand rotation is used, thumb points in axis direction, fingers curling indicate rotation
         * The rotation is appended to already applied transforms, thus multiplied from the right. Set _fromLeft to true to switch and put it in front.
         */
        rotate(_by: Vector3, _fromLeft?: boolean): void;
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
         * Adjusts the rotation of this matrix to point the z-axis directly at the given target and tilts it to accord with the given up vector,
         * respectively calculating yaw and pitch. If no up vector is given, the previous up-vector is used.
         * When _preserveScaling is false, a rotated identity matrix is the result.
         */
        lookAt(_target: Vector3, _up?: Vector3, _preserveScaling?: boolean): void;
        lookAtRotate(_target: Vector3, _up?: Vector3, _preserveScaling?: boolean): void;
        /**
         * Adjusts the rotation of this matrix to match its y-axis with the given up-vector and facing its z-axis toward the given target at minimal angle,
         * respectively calculating yaw only. If no up vector is given, the previous up-vector is used.
         * When _preserveScaling is false, a rotated identity matrix is the result.
         */
        showTo(_target: Vector3, _up?: Vector3, _preserveScaling?: boolean): void;
        /**
         * Add a translation by the given vector to this matrix.
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
         * Add a scaling by the given vector to this matrix
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
         * Calculates and returns the euler-angles representing the current rotation of this matrix
         */
        getEulerAngles(): Vector3;
        /**
         * Sets the elements of this matrix to the values of the given matrix
         */
        set(_to: Matrix4x4): void;
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
         * Return a copy of this
         */
        get copy(): Matrix4x4;
        getTranslationTo(_target: Matrix4x4): Vector3;
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
     * Class for creating random values, supporting Javascript's Math.random and a deterministig pseudo-random number generator (PRNG)
     * that can be fed with a seed and then returns a reproducable set of random numbers (if the precision of Javascript allows)
     *
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Random {
        static default: Random;
        private generate;
        /**
         * Create an instance of [[Random]]. If desired, creates a PRNG with it and feeds the given seed.
         * @param _ownGenerator Default is false
         * @param _seed Default is Math.random()
         */
        constructor(_ownGenerator?: boolean, _seed?: number);
        /**
         * Creates a dererminstic PRNG with the given seed
         */
        static createGenerator(_seed: number): Function;
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
    }
    /**
     * Standard [[Random]]-instance using Math.random().
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
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector3 extends Mutable {
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
        static TRANSFORMATION(_vector: Vector3, _matrix: Matrix4x4, _includeTranslation?: boolean): Vector3;
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
         */
        get copy(): Vector3;
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
        transform(_matrix: Matrix4x4, _includeTranslation?: boolean): void;
        /**
         * Drops the z-component and returns a Vector2 consisting of the x- and y-components
         */
        toVector2(): Vector2;
        /**
         * Reflects this vector at a given normal. See [[REFLECTION]]
         */
        reflect(_normal: Vector3): void;
        /**
         * Shuffles the components of this vector
         */
        shuffle(): void;
        /**
         * Returns a formatted string representation of this vector
         */
        toString(): string;
        /**
         * Uses the standard array.map functionality to perform the given function on all components of this vector
         */
        map(_function: (value: number, index: number, array: Float32Array) => number): Vector3;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
    /**
     * Abstract base class for all meshes.
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Mesh extends Mutable implements SerializableResource {
        /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
        static readonly baseClass: typeof Mesh;
        /** list of all the subclasses derived from this class, if they registered properly*/
        static readonly subclasses: typeof Mesh[];
        vertices: Float32Array;
        indices: Uint16Array;
        textureUVs: Float32Array;
        normalsFace: Float32Array;
        idResource: string;
        name: string;
        renderBuffers: RenderBuffers;
        constructor(_name?: string);
        static getBufferSpecification(): BufferSpecification;
        protected static registerSubclass(_subClass: typeof Mesh): number;
        get type(): string;
        useRenderBuffers(_shader: typeof Shader, _world: Matrix4x4, _projection: Matrix4x4, _id?: number): void;
        createRenderBuffers(): void;
        deleteRenderBuffers(_shader: typeof Shader): void;
        getVertexCount(): number;
        getIndexCount(): number;
        create(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        /**Flip the Normals of a Mesh to render opposite side of each polygon*/
        flipNormals(): void;
        protected calculateFaceNormals(): Float32Array;
        protected abstract createVertices(): Float32Array;
        protected abstract createTextureUVs(): Float32Array;
        protected abstract createIndices(): Uint16Array;
        protected abstract createFaceNormals(): Float32Array;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace FudgeCore {
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
    class MeshCube extends Mesh {
        static readonly iSubclass: number;
        constructor(_name?: string);
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace FudgeCore {
    /** This function type takes x and z as Parameters and returns a number - to be used as a heightmap.
     * x and z are mapped from 0 to 1 when used to generate a Heightmap Mesh
     * @authors Simon Storl-Schulke, HFU, 2020*/
    type heightMapFunction = (x: number, z: number) => number;
    /**
     * Generates a planar Grid and applies a Heightmap-Function to it.
     * @authors Jirka Dell'Oro-Friedl, Simon Storl-Schulke, HFU, 2020
     */
    class MeshHeightMap extends Mesh {
        static readonly iSubclass: number;
        private resolutionX;
        private resolutionZ;
        private heightMapFunction;
        constructor(_name?: string, _resolutionX?: number, _resolutionZ?: number, _heightMapFunction?: heightMapFunction);
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
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
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace FudgeCore {
    /**
     * Generate a simple quad with edges of length 1, the face consisting of two trigons
     * ```plaintext
     *        0 __ 3
     *         |__|
     *        1    2
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshQuad extends Mesh {
        static readonly iSubclass: number;
        constructor(_name?: string);
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace FudgeCore {
    /**
     * Generate a UV Sphere with a given number of sectors and stacks (clamped at 128*128)
     * Implementation based on http://www.songho.ca/opengl/gl_sphere.html
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshSphere extends Mesh {
        static readonly iSubclass: number;
        normals: Float32Array;
        private sectors;
        private stacks;
        constructor(_name?: string, _sectors?: number, _stacks?: number);
        create(_sectors?: number, _stacks?: number): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Promise<Serializable>;
        mutate(_mutator: Mutator): Promise<void>;
        protected createIndices(): Uint16Array;
        protected createVertices(): Float32Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
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
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace FudgeCore {
    /**
     * Generate a Torus with a given thickness and the number of major- and minor segments
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    class MeshTorus extends Mesh {
        static readonly iSubclass: number;
        normals: Float32Array;
        private thickness;
        private majorSegments;
        private minorSegments;
        constructor(_name?: string, _thickness?: number, _majorSegments?: number, _minorSegments?: number);
        create(): void;
        protected createIndices(): Uint16Array;
        protected createVertices(): Float32Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace FudgeCore {
    class Ray {
        origin: Vector3;
        direction: Vector3;
        length: number;
        constructor(_direction?: Vector3, _origin?: Vector3, _length?: number);
        /**
         * Returns the point of intersection of this ray with a plane defined by
         * the given point of origin and the planes normal. All values and calculations
         * must be relative to the same coordinate system, preferably the world
         */
        intersectPlane(_origin: Vector3, _normal: Vector3): Vector3;
        /**
         * Returns the shortest distance from the ray to the given target point.
         * All values and calculations must be relative to the same coordinate system, preferably the world.
         */
        getDistance(_target: Vector3): Vector3;
    }
}
declare namespace FudgeCore {
    class RayHit {
        node: Node;
        face: number;
        zBuffer: number;
        constructor(_node?: Node, _face?: number, _zBuffer?: number);
    }
}
declare namespace FudgeCore {
    type MapLightTypeToLightList = Map<TypeOfLight, ComponentLight[]>;
    /**
     * Rendered texture for each node for picking
     */
    interface PickBuffer {
        node: Node;
        texture: WebGLTexture;
        frameBuffer: WebGLFramebuffer;
    }
    /**
     * The main interface to the render engine, here WebGL, which is used mainly in the superclass [[RenderOperator]]
     */
    abstract class RenderManager extends RenderOperator {
        static rectClip: Rectangle;
        private static timestampUpdate;
        private static pickBuffers;
        /**
         * Clear the offscreen renderbuffer with the given [[Color]]
         */
        static clear(_color?: Color): void;
        /**
         * Reset the offscreen framebuffer to the original RenderingContext
         */
        static resetFrameBuffer(_color?: Color): void;
        /**
         * Draws the graph for RayCasting starting with the given [[Node]] using the camera given [[ComponentCamera]].
         */
        static drawGraphForRayCast(_node: Node, _cmpCamera: ComponentCamera): PickBuffer[];
        /**
         * Browses through the buffers (previously created with [[drawGraphForRayCast]]) of the size given
         * and returns an unsorted list of the values at the given position, representing node-ids and depth information as [[RayHit]]s
         */
        static pickNodeAt(_pos: Vector2, _pickBuffers: PickBuffer[], _rect: Rectangle): RayHit[];
        /**
         * The main rendering function to be called from [[Viewport]].
         * Draws the graph starting with the given [[Node]] using the camera given [[ComponentCamera]].
         */
        static drawGraph(_node: Node, _cmpCamera: ComponentCamera, _drawNode?: Function): void;
        /**
         * Recursivly iterates over the graph and renders each node and all successors with the given render function
         */
        private static drawGraphRecursive;
        /**
         * The standard render function for drawing a single node
         */
        private static drawNode;
        /**
         * The render function for drawing buffers for picking. Renders each node on a dedicated buffer with id and depth values instead of colors
         */
        private static drawNodeForRayCast;
        /**
         * Creates a texture buffer to be uses as pick-buffer
         */
        private static getRayCastTexture;
        /**
         * Recursively iterates over the graph starting with the node given, recalculates all world transforms,
         * collects all lights and feeds all shaders used in the graph with these lights
         */
        private static setupTransformAndLights;
        /**
         * Set light data in shaders
         */
        private static setLightsInShader;
    }
}
declare namespace FudgeCore {
    abstract class RenderParticles extends RenderManager {
        static drawParticles(): void;
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
    }
}
declare namespace FudgeCore {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class ShaderFlat extends Shader {
        static readonly iSubclass: number;
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /**
     * Matcap (Material Capture) shading. The texture provided by the coat is used as a matcap material.
     * Implementation based on https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
     * @authors Simon Storl-Schulke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class ShaderMatCap extends Shader {
        static readonly iSubclass: number;
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /**
     * Renders for Raycasting
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class ShaderRayCast extends Shader {
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /**
     * Textured shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class ShaderTexture extends Shader {
        static readonly iSubclass: number;
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class ShaderUniColor extends Shader {
        static readonly iSubclass: number;
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace FudgeCore {
    /**
     * Baseclass for different kinds of textures.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Texture extends Mutable {
        name: string;
        protected renderData: {
            [key: string]: unknown;
        };
        useRenderData(): void;
        protected reduceMutator(_mutator: Mutator): void;
    }
    /**
     * Texture created from an existing image
     */
    class TextureImage extends Texture implements SerializableResource {
        image: HTMLImageElement;
        url: RequestInfo;
        idResource: string;
        constructor(_url?: RequestInfo);
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
    class TextureCanvas extends Texture {
    }
    /**
     * Texture created from a FUDGE-Sketch
     */
    class TextureSketch extends TextureCanvas {
    }
    /**
     * Texture created from an HTML-page
     */
    class TextureHTML extends TextureCanvas {
    }
}
declare namespace FudgeCore {
    /**
     * Determines the mode a loop runs in
     */
    enum LOOP_MODE {
        /** Loop cycles controlled by window.requestAnimationFrame */
        FRAME_REQUEST = "frameRequest",
        /** Loop cycles with the given framerate in [[Time]].game */
        TIME_GAME = "timeGame",
        /** Loop cycles with the given framerate in realtime, independent of [[Time]].game */
        TIME_REAL = "timeReal"
    }
    /**
     * Core loop of a Fudge application. Initializes automatically and must be started explicitly.
     * It then fires [[EVENT]].LOOP\_FRAME to all added listeners at each frame
     *
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Loop extends EventTargetStatic {
        /** The gametime the loop was started, overwritten at each start */
        static timeStartGame: number;
        /** The realtime the loop was started, overwritten at each start */
        static timeStartReal: number;
        /** The gametime elapsed since the last loop cycle */
        static timeFrameGame: number;
        /** The realtime elapsed since the last loop cycle */
        static timeFrameReal: number;
        private static timeLastFrameGame;
        private static timeLastFrameReal;
        private static timeLastFrameGameAvg;
        private static timeLastFrameRealAvg;
        private static running;
        private static mode;
        private static idIntervall;
        private static idRequest;
        private static fpsDesired;
        private static framesToAverage;
        private static syncWithAnimationFrame;
        /**
         * Starts the loop with the given mode and fps
         * @param _mode
         * @param _fps Is only applicable in TIME-modes
         * @param _syncWithAnimationFrame Experimental and only applicable in TIME-modes. Should defer the loop-cycle until the next possible animation frame.
         */
        static start(_mode?: LOOP_MODE, _fps?: number, _syncWithAnimationFrame?: boolean): void;
        /**
         * Stops the loop
         */
        static stop(): void;
        static continue(): void;
        static getFpsGameAverage(): number;
        static getFpsRealAverage(): number;
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
     * Supports [[Timer]]s similar to window.setInterval but with respect to the scaled time.
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
         * Returns the game-time-object which starts automatically and serves as base for various internal operations.
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
         * Stops and deletes all [[Timer]]s attached. Should be called before this Time-object leaves scope
         */
        clearAllTimers(): void;
        /**
         * Deletes [[Timer]] found using the internal id of the connected interval-object
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
         * This method is called internally by [[Time]] and [[Timer]] and must not be called otherwise
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
         * Returns true if there are [[Timers]] installed to this
         */
        hasTimers(): boolean;
        /**
         * Recreates [[Timer]]s when scaling changes
         */
        private rescaleAllTimers;
    }
}
declare namespace FudgeCore {
    /**
     * Defines the signature of handler functions for [[TimerEventƒ]]s, very similar to usual event handler
     */
    type TimerHandler = (_event: EventTimer) => void;
    /**
     * A [[Timer]]-instance internally uses window.setInterval to call a given handler with a given frequency a given number of times,
     * passing an [[TimerEventƒ]]-instance with additional information and given arguments.
     * The frequency scales with the [[Time]]-instance the [[Timer]]-instance is attached to.
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
         * Creates a [[Timer]] instance.
         * @param _time The [[Time]] instance, the timer attaches to
         * @param _elapse The time in milliseconds to elapse, to the next call of _handler, measured in _time
         * @param _count The desired number of calls to _handler, Timer deinstalls automatically after last call. Passing 0 invokes infinite calls
         * @param _handler The [[TimerHandler]] instance to call
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
         * Attaches a copy of this at its current state to the same [[Time]]-instance. Used internally when rescaling [[Time]]
         */
        installCopy(): Timer;
        /**
         * Clears the timer, removing it from the interval-timers handled by window
         */
        clear(): void;
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
        static load(): void;
        static save(_toSave: MapFilenameToContent): void;
        static handleFileSelect(_event: Event): Promise<void>;
        static loadFiles(_fileList: FileList, _loaded: MapFilenameToContent): Promise<void>;
    }
}
