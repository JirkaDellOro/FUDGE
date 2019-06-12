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
        protected mutate(_mutator: Mutator): void;
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
    }
    interface RenderCoat {
        vao: WebGLVertexArrayObject;
        coat: Coat;
    }
    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    class RenderOperator {
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
        /** TODO: back to private
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        static attributePointer(_attributeLocation: number, _bufferSpecification: BufferSpecification): void;
        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         * @param _renderShader
         * @param _renderBuffers
         * @param _renderCoat
         * @param _projection
         */
        protected static draw(_renderShader: RenderShader, _renderBuffers: RenderBuffers, _renderCoat: RenderCoat, _projection: Matrix4x4): void;
        protected static createProgram(_shaderClass: typeof Shader): RenderShader;
        protected static useProgram(_shaderInfo: RenderShader): void;
        protected static deleteProgram(_program: RenderShader): void;
        protected static createBuffers(_mesh: Mesh): RenderBuffers;
        protected static useBuffers(_renderBuffers: RenderBuffers): void;
        protected static deleteBuffers(_bufferInfo: RenderBuffers): void;
        protected static createParameter(_coat: Coat): RenderCoat;
        protected static useParameter(_coatInfo: RenderCoat): void;
        protected static deleteParameter(_coatInfo: RenderCoat): void;
    }
}
declare namespace Fudge {
    class Coat extends Mutable {
        name: string;
        protected renderData: {
            [key: string]: unknown;
        };
        mutate(_mutator: Mutator): void;
        useRenderData(_renderShader: RenderShader): void;
        protected reduceMutator(): void;
    }
    class CoatColored extends Coat {
        color: Color;
        constructor(_color?: Color);
    }
    class CoatTextured extends Coat {
        texture: TextureImage;
        tilingX: number;
        tilingY: number;
        repetition: boolean;
    }
    /**
     * Adds and enables a Texture passed to this material.
     * @param _textureSource A string holding the path to the location of the texture.
     */
    /**
     * Removes and disables a texture that was added to this material.
     */
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
    class Serializer {
        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the Serializable interface
         */
        static serialize(_object: Serializable): Serialization;
        /**
         * Returns a FUDGE-object reconstructed from the information in the serialization-object given,
         * including attached components, children, superclass-objects
         * @param _serialization
         */
        static deserialize(_serialization: Serialization): Serializable;
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
         * Retrieves the type of this components subclass as the name of the runtime class
         * @returns The type of the component
         */
        readonly type: string;
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
         * TODO: write tests to prove consistency and correct exception handling
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
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
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
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMaterial extends Component {
        private material;
        initialize(_material: Material): void;
        getMaterial(): Material;
    }
}
declare namespace Fudge {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends Component {
        private mesh;
        setMesh(_mesh: Mesh): void;
        getMesh(): Mesh;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }
}
declare namespace Fudge {
    /**
     * Class to hold the transformation-data of the mesh that is attached to the same node.
     * The pivot-transformation does not affect the transformation of the node itself or its children.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentPivot extends Component {
        local: Matrix4x4;
        readonly position: Vector3;
        /**
         * Resets this.matrix to idenity Matrix.
         */
        reset(): void;
        /**
         * Translate the transformation along the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        translate(_x: number, _y: number, _z: number): void;
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
        /**
         * Rotate the transformation along the around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateX(_angle: number): void;
        /**
         * Rotate the transformation along the around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateY(_angle: number): void;
        /**
         * Rotate the transformation along the around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateZ(_zAngle: number): void;
        /**
         * Wrapper function to rotate the transform so that its z-Axis is facing in the direction of the targets position.
         * TODO: Use world transformations! Does it make sense in Pivot?
         * @param _target The target to look at.
         */
        lookAt(_target: Vector3): void;
        /**
         * Scale the transformation along the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        scale(_xScale: number, _yScale: number, _zScale: number): void;
        /**
         * Scale the transformation along the x-axis.
         * @param _scale The value to scale by.
         */
        scaleX(_scale: number): void;
        /**
         * Scale the transformation along the y-axis.
         * @param _scale The value to scale by.
         */
        scaleY(_scale: number): void;
        /**
         * Scale the transformation along the z-axis.
         * @param _scale The value to scale by.
         */
        scaleZ(_scale: number): void;
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
    }
}
declare namespace Fudge {
    /**
     * The transformation-data of the node, extends ComponentPivot for fewer redundancies.
     * Affects the origin of a node and its descendants. Use [[ComponentPivot]] to transform only the mesh attached
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends ComponentPivot {
        world: Matrix4x4;
        constructor();
        readonly WorldPosition: Vector3;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        mutate(_mutator: Mutator): void;
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
    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(_r: number, _g: number, _b: number, _a: number);
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
        /** dispatched to a child [[Node]] and its ancestors after it was appended to a parent */
        CHILD_APPEND = "childAdd",
        /** dispatched to a child [[Node]] and its ancestors just before its being removed from its parent */
        CHILD_REMOVE = "childRemove",
        /** dispatched to a [[Mutable]] when its being mutated */
        MUTATE = "mutate",
        /** dispatched to [[Viewport]] when it gets the focus to receive keyboard input */
        FOCUS_IN = "focusin",
        /** dispatched to [[Viewport]] when it loses the focus to receive keyboard input */
        FOCUS_OUT = "focusout"
    }
    /**
     * Mappings of standard DOM/Browser-Events as passed from a canvas to the viewport
     */
    const enum EVENT_KEYBOARD {
        UP = "\u0192keyup",
        DOWN = "\u0192keydown"
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
    class KeyboardEventƒ extends KeyboardEvent {
        constructor(type: string, _event: KeyboardEventƒ);
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
    /**
     * Core loop of a Fudge application. Initializes automatically and must be startet via Loop.start().
     * it then fires EVENT.ANIMATION_FRAME to all listeners added at each animation frame requested from the host window
     */
    class Loop extends EventTargetStatic {
        private static running;
        /**
         * Start the core loop
         */
        static start(): void;
        private static loop;
    }
}
declare namespace Fudge {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material {
        name: string;
        private shaderType;
        private coat;
        constructor(_name: string, _shader?: typeof Shader, _coat?: Coat);
        createCoatMatchingShader(): Coat;
        setCoat(_coat: Coat): void;
        getCoat(): Coat;
        setShader(_shaderType: typeof Shader): void;
        getShader(): typeof Shader;
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
        getParent(): Node | null;
        getAncestor(): Node | null;
        readonly cmpTransform: ComponentTransform;
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
         * Generator yielding the node and all successors in the branch below for iteration
         */
        readonly branch: IterableIterator<Node>;
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
        branch: Node;
        rectSource: Rectangle;
        rectDestination: Rectangle;
        frameClientToCanvas: FramingScaled;
        frameCanvasToDestination: FramingComplex;
        frameDestinationToSource: FramingScaled;
        frameSourceToRender: FramingScaled;
        adjustingFrames: boolean;
        adjustingCamera: boolean;
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
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph(): void;
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
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
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        private createSceneGraph;
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
        abstract getPoint(_pointInFrame: Point, _rectFrame: Rectangle): Point;
        abstract getPointInverse(_point: Point, _rect: Rectangle): Point;
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
     * Simple class for 4x4 transformation matrix operations.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix4x4 extends Mutable implements Serializable {
        data: Float32Array;
        constructor();
        static readonly identity: Matrix4x4;
        /**
         * Wrapper function that multiplies a passed matrix by a scalingmatrix with passed x-, y- and z-multipliers.
         * @param _matrix The matrix to multiply.
         * @param _x The scaling multiplier for the x-Axis.
         * @param _y The scaling multiplier for the y-Axis.
         * @param _z The scaling multiplier for the z-Axis.
         */
        static scale(_matrix: Matrix4x4, _x: number, _y: number, _z: number): Matrix4x4;
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static multiply(_a: Matrix4x4, _b: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _matrix Tha matrix to compute the inverse of.
         */
        static inverse(_matrix: Matrix4x4): Matrix4x4;
        /**
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static lookAt(_transformPosition: Vector3, _targetPosition: Vector3): Matrix4x4;
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace borer on the z-axis.
         */
        static centralProjection(_aspect: number, _fieldOfViewInDegrees: number, _near: number, _far: number, _direction: FIELD_OF_VIEW): Matrix4x4;
        /**
         * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         * @param _near The positionvalue of the projectionspace's near border.
         * @param _far The positionvalue of the projectionspace's far border
         */
        static orthographicProjection(_left: number, _right: number, _bottom: number, _top: number, _near?: number, _far?: number): Matrix4x4;
        /**
        * Wrapper function that multiplies a passed matrix by a translationmatrix with passed x-, y- and z-values.
        * @param _matrix The matrix to multiply.
        * @param _xTranslation The x-value of the translation.
        * @param _yTranslation The y-value of the translation.
        * @param _zTranslation The z-value of the translation.
        */
        static translate(_matrix: Matrix4x4, _xTranslation: number, _yTranslation: number, _zTranslation: number): Matrix4x4;
        /**
        * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
        * @param _matrix The matrix to multiply.
        * @param _angleInDegrees The angle to rotate by.
        */
        static rotateX(_matrix: Matrix4x4, _angleInDegrees: number): Matrix4x4;
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateY(_matrix: Matrix4x4, _angleInDegrees: number): Matrix4x4;
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateZ(_matrix: Matrix4x4, _angleInDegrees: number): Matrix4x4;
        /**
         * Returns a matrix that translates coordinates on the x-, y- and z-axis when multiplied by.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        private static translation;
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        private static xRotation;
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        private static yRotation;
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        private static zRotation;
        /**
         * Returns a matrix that scales coordinates on the x-, y- and z-axis when multiplied by.
         * @param _x The scaling multiplier for the x-axis.
         * @param _y The scaling multiplier for the y-axis.
         * @param _z The scaling multiplier for the z-axis.
         */
        private static scaling;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        getMutator(): Mutator;
        protected reduceMutator(_mutator: Mutator): void;
    }
}
declare namespace Fudge {
    /**
     * Class storing and manipulating a threedimensional vector
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector3 {
        private data;
        constructor(_x?: number, _y?: number, _z?: number);
        readonly Data: number[];
        readonly x: number;
        readonly y: number;
        readonly z: number;
        /**
         * The up-Vector (0, 1, 0)
         */
        static readonly up: Vector3;
        /**
         * The down-Vector (0, -1, 0)
         */
        static readonly down: Vector3;
        /**
         * The forward-Vector (0, 0, 1)
         */
        static readonly forward: Vector3;
        /**
         * The backward-Vector (0, 0, -1)
         */
        static readonly backward: Vector3;
        /**
         * The right-Vector (1, 0, 0)
         */
        static readonly right: Vector3;
        /**
         * The left-Vector (-1, 0, 0)
         */
        static readonly left: Vector3;
        /**
         * Adds two vectors.
         * @param _a The first vector to add
         * @param _b The second vector to add
         * @returns A new vector representing the sum of the given vectors
         */
        static add(_a: Vector3, _b: Vector3): Vector3;
        /**
        * Sums up multiple vectors.
        * @param _a The first vector to add
        * @param _b The second vector to add
        * @returns A new vector representing the sum of the given vectors
        */
        static sum(..._vectors: Vector3[]): Vector3;
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static subtract(_a: Vector3, _b: Vector3): Vector3;
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the crossproduct of the given vectors
         */
        static cross(_a: Vector3, _b: Vector3): Vector3;
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static dot(_a: Vector3, _b: Vector3): number;
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         * @returns A new vector representing the given vector scaled to the length of 1
         */
        static normalize(_vector: Vector3): Vector3;
    }
}
declare namespace Fudge {
    abstract class Mesh implements Serializable {
        vertices: Float32Array;
        indices: Uint16Array;
        textureUVs: Float32Array;
        static getBufferSpecification(): BufferSpecification;
        getVertexCount(): number;
        getIndexCount(): number;
        abstract serialize(): Serialization;
        abstract deserialize(_serialization: Serialization): Serializable;
        abstract create(): void;
        protected abstract createVertices(): Float32Array;
        protected abstract createTextureUVs(): Float32Array;
        protected abstract createIndices(): Uint16Array;
    }
}
declare namespace Fudge {
    /**
     * Simple class to compute the vertexpositions for a box.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshCube extends Mesh {
        width: number;
        height: number;
        depth: number;
        constructor(_width: number, _height: number, _depth: number);
        create(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        createVertices(): Float32Array;
        createTextureUVs(): Float32Array;
        createIndices(): Uint16Array;
    }
}
declare namespace Fudge {
    /**
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshCubeNew extends Mesh {
        constructor();
        create(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
    }
}
declare namespace Fudge {
    /**
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshPyramid extends Mesh {
        constructor();
        create(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
    }
}
declare namespace Fudge {
    /**
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshQuad extends Mesh {
        constructor();
        create(): void;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
        protected createVertices(): Float32Array;
        protected createIndices(): Uint16Array;
        protected createTextureUVs(): Float32Array;
    }
}
declare namespace Fudge {
    /**
     * Manages the handling of the ressources that are going to be rendered by [[RenderOperator]].
     * Stores the references to the shader, the coat and the mesh used for each node registered.
     * With these references, the already buffered data is retrieved when rendering.
     */
    class RenderManager extends RenderOperator {
        /** Stores references to the compiled shader programs and makes them available via the references to shaders */
        private static programs;
        /** Stores references to the vertex array objects and makes them available via the references to coats */
        private static parameters;
        /** Stores references to the vertex buffers and makes them available via the references to meshes */
        private static buffers;
        private static nodes;
        /**
         * Register the node for rendering. Create a reference for it and increase the matching render-data references or create them first if necessary
         * @param _node
         */
        static addNode(_node: Node): void;
        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node
         */
        static addBranch(_node: Node): void;
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
         * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
         */
        static recalculateAllNodeTransforms(): void;
        static clear(_color?: Color): void;
        /**
         * Draws the branch starting with the given [[Node]] using the projection matrix given as _cameraMatrix.
         * If the node lacks a [[ComponentTransform]], respectively a worldMatrix, the matrix given as _matrix will be used to transform the node
         * or the identity matrix, if _matrix is null.
         * @param _node
         * @param _cameraMatrix
         * @param _world
         */
        static drawBranch(_node: Node, _cmpCamera: ComponentCamera, _world?: Matrix4x4): void;
        static drawNode(_node: Node, _projection: Matrix4x4): void;
        /**
         * Recursive method receiving a childnode and its parents updated world transform.
         * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
         * @param _node
         * @param _matrix
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
    /**
     * Static superclass for the representation of WebGl shaderprograms.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Shader {
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
    class ShaderBasic extends Shader {
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
