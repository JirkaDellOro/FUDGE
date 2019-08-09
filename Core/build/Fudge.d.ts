/// <reference types="webgl2" />
declare namespace Fudge {
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
        [attribute: string]: Object;
    }
    interface MutatorForAnimation extends Mutator {
        readonly forAnimation: null;
    }
    interface MutatorForUserInterface extends Mutator {
        readonly forUserInterface: null;
    }
    /**
     * Base class implementing mutability of instances of subclasses using [[Mutator]]-objects
     * thus providing and using interfaces created at runtime
     */
    abstract class Mutable extends EventTarget {
        /**
         * Retrieves the type of this mutable subclass as the name of the runtime class
         * @returns The type of the mutable
         */
        readonly type: string;
        /**
         * Collect applicable attributes of the instance and copies of their values in a Mutator-object
         */
        getMutator(): Mutator;
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
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
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
        mutate(_mutator: Mutator): void;
        /**
         * Reduces the attributes of the general mutator according to desired options for mutation. To be implemented in subclasses
         * @param _mutator
         */
        protected abstract reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
    class RenderInjector {
        private static coatInjections;
        static decorateCoat(_constructor: Function): void;
        private static injectRenderDataForCoatColored;
        private static injectRenderDataForCoatTextured;
    }
}
declare namespace Fudge {
    interface BufferSpecification {
        size: number;
        dataType: number;
        normalize: boolean;
        stride: number;
        offset: number;
    }
    interface RenderShader {
        program: WebGLProgram;
        attributes: {
            [name: string]: number;
        };
        uniforms: {
            [name: string]: WebGLUniformLocation;
        };
    }
    interface RenderBuffers {
        vertices: WebGLBuffer;
        indices: WebGLBuffer;
        nIndices: number;
        textureUVs: WebGLBuffer;
        normalsFace: WebGLBuffer;
    }
    interface RenderCoat {
        coat: Coat;
    }
    interface RenderLights {
        [type: string]: Float32Array;
    }
    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    abstract class RenderOperator {
        protected static crc3: WebGL2RenderingContext;
        private static rectViewport;
        /**
        * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
        * @param _value // value to check against null
        * @param _message // optional, additional message for the exception
        */
        static assert<T>(_value: T | null, _message?: string): T;
        /**
         * Initializes offscreen-canvas, renderingcontext and hardware viewport.
         */
        static initialize(): void;
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
        /**
         * Convert light data to flat arrays
         */
        protected static createRenderLights(_lights: MapLightTypeToLightList): RenderLights;
        /**
         * Set light data in shaders
         */
        protected static setLightsInShader(_renderShader: RenderShader, _lights: MapLightTypeToLightList): void;
        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         * @param _renderShader
         * @param _renderBuffers
         * @param _renderCoat
         * @param _projection
         */
        protected static draw(_renderShader: RenderShader, _renderBuffers: RenderBuffers, _renderCoat: RenderCoat, _world: Matrix4x4, _projection: Matrix4x4): void;
        protected static createProgram(_shaderClass: typeof Shader): RenderShader;
        protected static useProgram(_shaderInfo: RenderShader): void;
        protected static deleteProgram(_program: RenderShader): void;
        protected static createBuffers(_mesh: Mesh): RenderBuffers;
        protected static useBuffers(_renderBuffers: RenderBuffers): void;
        protected static deleteBuffers(_renderBuffers: RenderBuffers): void;
        protected static createParameter(_coat: Coat): RenderCoat;
        protected static useParameter(_coatInfo: RenderCoat): void;
        protected static deleteParameter(_coatInfo: RenderCoat): void;
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        private static setAttributeStructure;
    }
}
declare namespace Fudge {
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
        mutate(_mutator: Mutator): void;
        useRenderData(_renderShader: RenderShader): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        protected reduceMutator(): void;
    }
    /**
     * The simplest [[Coat]] providing just a color
     */
    class CoatColored extends Coat {
        color: Color;
        constructor(_color?: Color);
    }
    /**
     * A [[Coat]] providing a texture and additional data for texturing
     */
    class CoatTextured extends Coat {
        texture: TextureImage;
        tilingX: number;
        tilingY: number;
        repetition: boolean;
    }
}
declare namespace Fudge {
    type General = any;
    interface Serialization {
        [type: string]: General;
    }
    interface Serializable {
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
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
        static registerNamespace(_namespace: Object): void;
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
        static deserialize(_serialization: Serialization): Serializable;
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
        private static reconstruct;
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
declare namespace Fudge {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Component extends Mutable implements Serializable {
        protected singleton: boolean;
        private container;
        private active;
        activate(_on: boolean): void;
        readonly isActive: boolean;
        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        readonly isSingleton: boolean;
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
        deserialize(_serialization: Serialization): Serializable;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
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
        private projection;
        private transform;
        private fieldOfView;
        private aspectRatio;
        private direction;
        private backgroundColor;
        private backgroundEnabled;
        getProjection(): PROJECTION;
        getBackgoundColor(): Color;
        getBackgroundEnabled(): boolean;
        getAspect(): number;
        getFieldOfView(): number;
        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        readonly ViewProjectionMatrix: Matrix4x4;
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        projectCentral(_aspect?: number, _fieldOfView?: number, _direction?: FIELD_OF_VIEW): void;
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvas.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left?: number, _right?: number, _bottom?: number, _top?: number): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes;
        mutate(_mutator: Mutator): void;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentLight extends Component {
        private light;
        constructor(_light?: Light);
        getLight(): Light;
    }
}
declare namespace Fudge {
    /**
     * Attaches a [[Material]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMaterial extends Component {
        material: Material;
        constructor(_material?: Material);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }
}
declare namespace Fudge {
    /**
     * Attaches a [[Mesh]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends Component {
        pivot: Matrix4x4;
        mesh: Mesh;
        constructor(_mesh?: Mesh);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }
}
declare namespace Fudge {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentScript extends Component {
        constructor();
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }
}
declare namespace Fudge {
    /**
     * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends Component {
        local: Matrix4x4;
        constructor(_matrix?: Matrix4x4);
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        mutate(_mutator: Mutator): void;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
    /**
     * The filters corresponding to debug activities, more to come
     */
    enum DEBUG_FILTER {
        NONE = 0,
        INFO = 1,
        LOG = 2,
        WARN = 4,
        ERROR = 8,
        ALL = 15
    }
    type MapDebugTargetToDelegate = Map<DebugTarget, Function>;
    interface MapDebugFilterToDelegate {
        [filter: number]: Function;
    }
}
declare namespace Fudge {
    /**
     * Base class for the different DebugTargets, mainly for technical purpose of inheritance
     */
    abstract class DebugTarget {
        delegates: MapDebugFilterToDelegate;
        static mergeArguments(_message: Object, ..._args: Object[]): string;
    }
}
declare namespace Fudge {
    /**
     * Routing to the alert box
     */
    class DebugAlert extends DebugTarget {
        static delegates: MapDebugFilterToDelegate;
        static createDelegate(_headline: string): Function;
    }
}
declare namespace Fudge {
    /**
     * Routing to the standard-console
     */
    class DebugConsole extends DebugTarget {
        static delegates: MapDebugFilterToDelegate;
    }
}
declare namespace Fudge {
    /**
     * The Debug-Class offers functions known from the console-object and additions,
     * routing the information to various [[DebugTargets]] that can be easily defined by the developers and registerd by users
     */
    class Debug {
        /**
         * For each set filter, this associative array keeps references to the registered delegate functions of the chosen [[DebugTargets]]
         */
        private static delegates;
        /**
         * De- / Activate a filter for the given DebugTarget.
         * @param _target
         * @param _filter
         */
        static setFilter(_target: DebugTarget, _filter: DEBUG_FILTER): void;
        /**
         * Debug function to be implemented by the DebugTarget.
         * info(...) displays additional information with low priority
         * @param _message
         * @param _args
         */
        static info(_message: Object, ..._args: Object[]): void;
        /**
         * Debug function to be implemented by the DebugTarget.
         * log(...) displays information with medium priority
         * @param _message
         * @param _args
         */
        static log(_message: Object, ..._args: Object[]): void;
        /**
         * Debug function to be implemented by the DebugTarget.
         * warn(...) displays information about non-conformities in usage, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static warn(_message: Object, ..._args: Object[]): void;
        /**
         * Debug function to be implemented by the DebugTarget.
         * error(...) displays critical information about failures, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static error(_message: Object, ..._args: Object[]): void;
        /**
         * Lookup all delegates registered to the filter and call them using the given arguments
         * @param _filter
         * @param _message
         * @param _args
         */
        private static delegate;
    }
}
declare namespace Fudge {
    /**
     * Routing to a HTMLDialogElement
     */
    class DebugDialog extends DebugTarget {
    }
}
declare namespace Fudge {
    /**
     * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
     */
    class DebugTextArea extends DebugTarget {
        static textArea: HTMLTextAreaElement;
        static delegates: MapDebugFilterToDelegate;
        static createDelegate(_headline: string): Function;
    }
}
declare namespace Fudge {
    /**
     * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
     */
    class Color extends Mutable {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(_r: number, _g: number, _b: number, _a: number);
        getArray(): Float32Array;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material implements SerializableResource {
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
        deserialize(_serialization: Serialization): Serializable;
    }
}
declare namespace Fudge {
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.
     * Using [[Recycler]] reduces load on the carbage collector and thus supports smooth performance
     */
    abstract class Recycler {
        private static depot;
        /**
         * Returns an object of the requested type from the depot, or a new one, if the depot was empty
         * @param _T The class identifier of the desired object
         */
        static get<T>(_T: new () => T): T;
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
declare namespace Fudge {
    interface SerializableResource extends Serializable {
        idResource: string;
    }
    interface Resources {
        [idResource: string]: SerializableResource;
    }
    interface SerializationOfResources {
        [idResource: string]: Serialization;
    }
    /**
     * Static class handling the resources used with the current FUDGE-instance.
     * Keeps a list of the resources and generates ids to retrieve them.
     * Resources are objects referenced multiple times but supposed to be stored only once
     */
    abstract class ResourceManager {
        static resources: Resources;
        static serialization: SerializationOfResources;
        /**
         * Generates an id for the resources and registers it with the list of resources
         * @param _resource
         */
        static register(_resource: SerializableResource): void;
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
         * @param _idResource
         */
        static get(_idResource: string): SerializableResource;
        /**
         * Creates and registers a resource from a [[Node]], copying the complete branch starting with it
         * @param _node A node to create the resource from
         * @param _replaceWithInstance if true (default), the node used as origin is replaced by a [[NodeResourceInstance]] of the [[NodeResource]] created
         */
        static registerNodeAsResource(_node: Node, _replaceWithInstance?: boolean): NodeResource;
        /**
         * Serialize all resources
         */
        static serialize(): SerializationOfResources;
        /**
         * Create resources from a serialization, deleting all resources previously registered
         * @param _serialization
         */
        static deserialize(_serialization: SerializationOfResources): Resources;
        private static deserializeResource;
    }
}
declare namespace Fudge {
    /**
     * Baseclass for different kinds of lights.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Light extends Mutable {
        color: Color;
        constructor(_color?: Color);
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
        direction: Vector3;
        constructor(_color?: Color, _direction?: Vector3);
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
declare namespace Fudge {
    type MapLightTypeToLightList = Map<string, ComponentLight[]>;
    /**
     * Controls the rendering of a branch of a scenetree, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[Framing]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Viewport extends EventTarget {
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
        lights: MapLightTypeToLightList;
        private branch;
        private crc2;
        private canvas;
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _branch
         * @param _camera
         */
        initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void;
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
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph(): void;
        /**
         * Draw this viewport
         */
        draw(): void;
        /**
         * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
         */
        adjustFrames(): void;
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        adjustCamera(): void;
        /**
         * Returns true if this viewport currently has focus and thus receives keyboard events
         */
        readonly hasFocus: boolean;
        /**
         * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events.
         * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire [[Event]]s accordingly.
         *
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
        /**
         * Collect all lights in the branch to pass to shaders
         */
        private collectLights;
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        private createSceneGraph;
    }
}
declare namespace Fudge {
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
        CHILD_APPEND = "childAdd",
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
        /** dispatched to [[NodeResourceInstance]] when it's content is set according to a serialization of a [[NodeResource]]  */
        NODERESOURCE_INSTANTIATED = "nodeResourceInstantiated"
    }
    const enum EVENT_POINTER {
        UP = "\u0192pointerup",
        DOWN = "\u0192pointerdown"
    }
    const enum EVENT_DRAGDROP {
        DRAG = "\u0192drag",
        DROP = "\u0192drop",
        START = "\u0192dragstart",
        END = "\u0192dragend",
        OVER = "\u0192dragover"
    }
    const enum EVENT_WHEEL {
        WHEEL = "\u0192wheel"
    }
    class PointerEventƒ extends PointerEvent {
        pointerX: number;
        pointerY: number;
        canvasX: number;
        canvasY: number;
        clientRect: ClientRect;
        constructor(type: string, _event: PointerEventƒ);
    }
    class DragDropEventƒ extends DragEvent {
        pointerX: number;
        pointerY: number;
        canvasX: number;
        canvasY: number;
        clientRect: ClientRect;
        constructor(type: string, _event: DragDropEventƒ);
    }
    class WheelEventƒ extends WheelEvent {
        constructor(type: string, _event: WheelEventƒ);
    }
    /**
     * Base class for EventTarget singletons, which are fixed entities in the structure of Fudge, such as the core loop
     */
    class EventTargetStatic extends EventTarget {
        protected static targetStatic: EventTargetStatic;
        protected constructor();
        static addEventListener(_type: string, _handler: EventListener): void;
        static removeEventListener(_type: string, _handler: EventListener): void;
        static dispatchEvent(_event: Event): boolean;
    }
}
declare namespace Fudge {
    class KeyboardEventƒ extends KeyboardEvent {
        constructor(type: string, _event: KeyboardEventƒ);
    }
    /**
     * Mappings of standard DOM/Browser-Events as passed from a canvas to the viewport
     */
    const enum EVENT_KEYBOARD {
        UP = "\u0192keyup",
        DOWN = "\u0192keydown"
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
        TRHEE = "Digit3",
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
declare namespace Fudge {
    interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    interface Border {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }
    interface Point {
        x: number;
        y: number;
    }
    /**
     * Framing describes how to map a rectangle into a given frame
     * and how points in the frame correspond to points in the resulting rectangle
     */
    abstract class Framing extends Mutable {
        /**
         * Maps a point in the given frame according to this framing
         * @param _pointInFrame The point in the frame given
         * @param _rectFrame The frame the point is relative to
         */
        abstract getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point;
        /**
         * Maps a point in a given rectangle back to a calculated frame of origin
         * @param _point The point in the rectangle
         * @param _rect The rectangle the point is relative to
         */
        abstract getPointInverse(_point: Point, _rect: Rectangle): Point;
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
        setSize(_width: number, _height: number): void;
        getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point;
        getPointInverse(_point: Point, _rect: Rectangle): Point;
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
        getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point;
        getPointInverse(_point: Point, _rect: Rectangle): Point;
        getRect(_rectFrame: Rectangle): Rectangle;
    }
    /**
     * The resulting rectangle fits into a margin given as fractions of the size of the frame given by normAnchor
     * plus an absolute padding given by pixelBorder. Display should fit into this.
     */
    class FramingComplex extends Framing {
        margin: Border;
        padding: Border;
        getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point;
        getPointInverse(_point: Point, _rect: Rectangle): Point;
        getRect(_rectFrame: Rectangle): Rectangle;
        getMutator(): Mutator;
    }
}
declare namespace Fudge {
    /**
     * Simple class for 3x3 matrix operations (This class can only handle 2D
     * transformations. Could be removed after applying full 2D compatibility to Mat4).
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix3x3 {
        data: number[];
        constructor();
        static projection(_width: number, _height: number): Matrix3x3;
        readonly Data: number[];
        identity(): Matrix3x3;
        translate(_matrix: Matrix3x3, _xTranslation: number, _yTranslation: number): Matrix3x3;
        rotate(_matrix: Matrix3x3, _angleInDegrees: number): Matrix3x3;
        scale(_matrix: Matrix3x3, _xScale: number, _yscale: number): Matrix3x3;
        multiply(_a: Matrix3x3, _b: Matrix3x3): Matrix3x3;
        private translation;
        private scaling;
        private rotation;
    }
}
declare namespace Fudge {
    /**
     * Stores a 4x4 transformation matrix and provides operations for it.
     * ```plaintext
     * [ 0, 1, 2, 3 ] <- row vector x
     * [ 4, 5, 6, 7 ] <- row vector y
     * [ 8, 9,10,11 ] <- row vector z
     * [12,13,14,15 ] <- translation
     *            ^  homogeneous column
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix4x4 extends Mutable implements Serializable {
        private data;
        private mutator;
        constructor();
        translation: Vector3;
        static readonly IDENTITY: Matrix4x4;
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
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static LOOK_AT(_transformPosition: Vector3, _targetPosition: Vector3, _up?: Vector3): Matrix4x4;
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
         * @param _translate
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
         * @param _scalar
         */
        static SCALING(_scalar: Vector3): Matrix4x4;
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace borer on the z-axis.
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
        * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
        * @param _matrix The matrix to multiply.
        * @param _angleInDegrees The angle to rotate by.
        */
        rotateX(_angleInDegrees: number): void;
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        rotateY(_angleInDegrees: number): void;
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        rotateZ(_angleInDegrees: number): void;
        lookAt(_target: Vector3, _up?: Vector3): void;
        translate(_by: Vector3): void;
        /**
         * Translate the transformation along the x-axis.
         * @param _x The value of the translation.
         */
        translateX(_x: number): void;
        /**
         * Translate the transformation along the y-axis.
         * @param _y The value of the translation.
         */
        translateY(_y: number): void;
        /**
         * Translate the transformation along the z-axis.
         * @param _z The value of the translation.
         */
        translateZ(_z: number): void;
        scale(_by: Vector3): void;
        scaleX(_by: number): void;
        scaleY(_by: number): void;
        scaleZ(_by: number): void;
        multiply(_matrix: Matrix4x4): void;
        getVectorRepresentation(): Vector3[];
        set(_to: Matrix4x4): void;
        get(): Float32Array;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        getMutator(): Mutator;
        mutate(_mutator: Mutator): void;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
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
        x: number;
        y: number;
        z: number;
        static X(_scale?: number): Vector3;
        static Y(_scale?: number): Vector3;
        static Z(_scale?: number): Vector3;
        static ZERO(): Vector3;
        static ONE(_scale?: number): Vector3;
        static TRANSFORMATION(_vector: Vector3, _matrix: Matrix4x4): Vector3;
        static NORMALIZATION(_vector: Vector3, _length?: number): Vector3;
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors: Vector3[]): Vector3;
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a: Vector3, _b: Vector3): Vector3;
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the crossproduct of the given vectors
         */
        static CROSS(_a: Vector3, _b: Vector3): Vector3;
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a: Vector3, _b: Vector3): number;
        add(_addend: Vector3): void;
        subtract(_subtrahend: Vector3): void;
        scale(_scale: number): void;
        normalize(_length?: number): void;
        set(_x?: number, _y?: number, _z?: number): void;
        get(): Float32Array;
        readonly copy: Vector3;
        transform(_matrix: Matrix4x4): void;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
    /**
     * Abstract base class for all meshes.
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Mesh implements SerializableResource {
        vertices: Float32Array;
        indices: Uint16Array;
        textureUVs: Float32Array;
        normalsFace: Float32Array;
        idResource: string;
        static getBufferSpecification(): BufferSpecification;
        getVertexCount(): number;
        getIndexCount(): number;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        abstract create(): void;
        protected abstract createVertices(): Float32Array;
        protected abstract createTextureUVs(): Float32Array;
        protected abstract createIndices(): Uint16Array;
        protected abstract createFaceNormals(): Float32Array;
    }
}
declare namespace Fudge {
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
        constructor();
        create(): void;
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace Fudge {
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
        constructor();
        create(): void;
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace Fudge {
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
        constructor();
        create(): void;
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
        protected createFaceNormals(): Float32Array;
    }
}
declare namespace Fudge {
    /**
     * Manages the handling of the ressources that are going to be rendered by [[RenderOperator]].
     * Stores the references to the shader, the coat and the mesh used for each node registered.
     * With these references, the already buffered data is retrieved when rendering.
     */
    abstract class RenderManager extends RenderOperator {
        /** Stores references to the compiled shader programs and makes them available via the references to shaders */
        private static renderShaders;
        /** Stores references to the vertex array objects and makes them available via the references to coats */
        private static renderCoats;
        /** Stores references to the vertex buffers and makes them available via the references to meshes */
        private static renderBuffers;
        private static nodes;
        private static timestampUpdate;
        /**
         * Register the node for rendering. Create a reference for it and increase the matching render-data references or create them first if necessary
         * @param _node
         */
        static addNode(_node: Node): void;
        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node
         * @returns false, if the given node has a current timestamp thus having being processed during latest RenderManager.update and no addition is needed
         */
        static addBranch(_node: Node): boolean;
        /**
         * Unregister the node so that it won't be rendered any more. Decrease the render-data references and delete the node reference.
         * @param _node
         */
        static removeNode(_node: Node): void;
        /**
         * Unregister the node and its valid successors in the branch to free renderer resources. Uses [[removeNode]]
         * @param _node
         */
        static removeBranch(_node: Node): void;
        /**
         * Reflect changes in the node concerning shader, coat and mesh, manage the render-data references accordingly and update the node references
         * @param _node
         */
        static updateNode(_node: Node): void;
        /**
         * Update the node and its valid successors in the branch using [[updateNode]]
         * @param _node
         */
        static updateBranch(_node: Node): void;
        /**
         * Viewports collect the lights relevant to the branch to render and calls setLights to pass the collection.
         * RenderManager passes it on to all shaders used that can process light
         * @param _lights
         */
        static setLights(_lights: MapLightTypeToLightList): void;
        /**
         * Update all render data. After this, multiple viewports can render their associated data without updating the same data multiple times
         */
        static update(): void;
        /**
         * Clear the offscreen renderbuffer with the given [[Color]]
         * @param _color
         */
        static clear(_color?: Color): void;
        /**
         * Draws the branch starting with the given [[Node]] using the projection matrix given as _cameraMatrix.
         * @param _node
         * @param _cameraMatrix
         */
        static drawBranch(_node: Node, _cmpCamera: ComponentCamera): void;
        private static drawNode;
        /**
         * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
         */
        private static recalculateAllNodeTransforms;
        /**
         * Recursive method receiving a childnode and its parents updated world transform.
         * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
         * @param _node
         * @param _world
         */
        private static recalculateTransformsOfNodeAndChildren;
        /**
         * Removes a reference to a program, parameter or buffer by decreasing its reference counter and deleting it, if the counter reaches 0
         * @param _in
         * @param _key
         * @param _deletor
         */
        private static removeReference;
        /**
         * Increases the counter of the reference to a program, parameter or buffer. Creates the reference, if it's not existent.
         * @param _in
         * @param _key
         * @param _creator
         */
        private static createReference;
    }
}
declare namespace Fudge {
    interface MapClassToComponents {
        [className: string]: Component[];
    }
    /**
     * Represents a node in the scenetree.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Node extends EventTarget implements Serializable {
        name: string;
        mtxWorld: Matrix4x4;
        timestampUpdate: number;
        private parent;
        private children;
        private components;
        private listeners;
        private captures;
        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        constructor(_name: string);
        /**
         * Returns a reference to this nodes parent node
         */
        getParent(): Node | null;
        /**
         * Traces back the ancestors of this node and returns the first
         */
        getAncestor(): Node | null;
        /**
         * Shortcut to retrieve this nodes [[ComponentTransform]]
         */
        readonly cmpTransform: ComponentTransform;
        /**
         * Shortcut to retrieve the local [[Matrix4x4]] attached to this nodes [[ComponentTransform]]
         * Returns null if no [[ComponentTransform]] is attached
         */
        /**
         * Returns a clone of the list of children
         */
        getChildren(): Node[];
        /**
         * Returns an array of references to childnodes with the supplied name.
         * @param _name The name of the nodes to be found.
         * @return An array with references to nodes
         */
        getChildrenByName(_name: string): Node[];
        /**
         * Adds the given reference to a node to the list of children, if not already in
         * @param _node The node to be added as a child
         * @throws Error when trying to add an ancestor of this
         */
        appendChild(_node: Node): void;
        /**
         * Removes the reference to the give node from the list of children
         * @param _node The node to be removed.
         */
        removeChild(_node: Node): void;
        /**
         * Returns the position of the node in the list of children or -1 if not found
         * @param _node The node to be found.
         */
        findChild(_node: Node): number;
        /**
         * Replaces a child node with another, preserving the position in the list of children
         * @param _replace The node to be replaced
         * @param _with The node to replace with
         */
        replaceChild(_replace: Node, _with: Node): boolean;
        /**
         * Generator yielding the node and all successors in the branch below for iteration
         */
        readonly branch: IterableIterator<Node>;
        isUpdated(_timestampUpdate: number): boolean;
        /**
         * Returns a clone of the list of components of the given class attached this node.
         * @param _class The class of the components to be found.
         */
        getComponents<T extends Component>(_class: typeof Component): T[];
        /**
         * Returns the first compontent found of the given class attached this node or null, if list is empty or doesn't exist
         * @param _class The class of the components to be found.
         */
        getComponent<T extends Component>(_class: typeof Component): T;
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
        deserialize(_serialization: Serialization): Serializable;
        /**
         * Adds an event listener to the node. The given handler will be called when a matching event is passed to the node.
         * Deviating from the standard EventTarget, here the _handler must be a function and _capture is the only option.
         * @param _type The type of the event, should be an enumerated value of NODE_EVENT, can be any string
         * @param _handler The function to call when the event reaches this node
         * @param _capture When true, the listener listens in the capture phase, when the event travels deeper into the hierarchy of nodes.
         */
        addEventListener(_type: EVENT | string, _handler: EventListener, _capture?: boolean): void;
        /**
         * Dispatches a synthetic event event to target. This implementation always returns true (standard: return true only if either event's cancelable attribute value is false or its preventDefault() method was not invoked)
         * The event travels into the hierarchy to this node dispatching the event, invoking matching handlers of the nodes ancestors listening to the capture phase,
         * than the matching handler of the target node in the target phase, and back out of the hierarchy in the bubbling phase, invoking appropriate handlers of the anvestors
         * @param _event The event to dispatch
         */
        dispatchEvent(_event: Event): boolean;
        /**
         * Broadcasts a synthetic event event to this node and from there to all nodes deeper in the hierarchy,
         * invoking matching handlers of the nodes listening to the capture phase. Watch performance when there are many nodes involved
         * @param _event The event to broadcast
         */
        broadcastEvent(_event: Event): void;
        private broadcastEventRecursive;
        /**
         * Sets the parent of this node to be the supplied node. Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        private setParent;
        private getBranchGenerator;
    }
}
declare namespace Fudge {
    /**
     * A node managed by [[ResourceManager]] that functions as a template for [[NodeResourceInstance]]s
     */
    class NodeResource extends Node implements SerializableResource {
        idResource: string;
    }
}
declare namespace Fudge {
    /**
     * An instance of a [[NodeResource]].
     * This node keeps a reference to its resource an can thus optimize serialization
     */
    class NodeResourceInstance extends Node {
        /** id of the resource that instance was created from */
        private idSource;
        constructor(_nodeResource: NodeResource);
        /**
         * Recreate this node from the [[NodeResource]] referenced
         */
        reset(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        /**
         * Set this node to be a recreation of the [[NodeResource]] given
         * @param _nodeResource
         */
        private set;
    }
}
declare namespace Fudge {
    /**
     * Static superclass for the representation of WebGl shaderprograms.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Shader {
        /** The type of coat that can be used with this shader to create a material */
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace Fudge {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderFlat extends Shader {
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace Fudge {
    /**
     * Textured shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderTexture extends Shader {
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace Fudge {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderUniColor extends Shader {
        static getCoat(): typeof Coat;
        static getVertexShaderSource(): string;
        static getFragmentShaderSource(): string;
    }
}
declare namespace Fudge {
    /**
     * Baseclass for different kinds of textures.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Texture extends Mutable {
        protected reduceMutator(): void;
    }
    /**
     * Texture created from an existing image
     */
    class TextureImage extends Texture {
        image: HTMLImageElement;
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
declare namespace Fudge {
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.
     * Supports interval- and timeout-callbacks identical with standard Javascript but with respect to the scaled time
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Time {
        private static gameTime;
        private start;
        private scale;
        private offset;
        private lastCallToElapsed;
        private timers;
        constructor();
        /**
         * Returns the game-time-object which starts automatically and serves as base for various internal operations.
         */
        static readonly game: Time;
        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         */
        get(): number;
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
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        getElapsedSincePreviousCall(): number;
        setTimeout(_callback: Function, _timeout: number, ..._arguments: Object[]): number;
        setInterval(_callback: Function, _timeout: number, ..._arguments: Object[]): number;
        clearTimeout(_id: number): void;
        clearInterval(_id: number): void;
        /**
         * Stops and deletes all timers attached. Should be called before this Time-object leaves scope
         */
        clearAllTimers(): void;
        rescaleAllTimers(): void;
        private setTimer;
    }
}
declare namespace Fudge {
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
        private static running;
        private static mode;
        private static idIntervall;
        private static fps;
        /**
         * Starts the loop with the given mode and fps
         * @param _mode
         * @param _fps
         */
        static start(_mode?: LOOP_MODE, _fps?: number): void;
        /**
         * Stops the loop
         */
        static stop(): void;
        private static loop;
        private static loopFrame;
        private static loopReal;
        private static loopGame;
    }
}
