/// <reference types="webgl2" />
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
        serialize(_object: Serializable): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }
}
declare namespace Fudge {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Nodes]].
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class Component implements Serializable {
        private container;
        private singleton;
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
    }
}
declare namespace Fudge {
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentCamera extends Component {
        private enabled;
        private orthographic;
        private projectionMatrix;
        private fieldOfView;
        private backgroundColor;
        private backgroundEnabled;
        activate(_on: boolean): void;
        readonly isActive: boolean;
        readonly isOrthographic: boolean;
        getBackgoundColor(): Vector3;
        getBackgroundEnabled(): boolean;
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
        projectCentral(_aspect?: number, _fieldOfView?: number): void;
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left?: number, _right?: number, _bottom?: number, _top?: number): void;
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
        readonly Material: Material;
    }
}
declare namespace Fudge {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends Component {
        private positions;
        private vertexCount;
        private bufferSpecification;
        private normals;
        initialize(_positions: Float32Array, _size?: number, _dataType?: number, _normalize?: boolean): void;
        readonly Positions: Float32Array;
        readonly BufferSpecification: BufferSpecification;
        readonly VertexCount: number;
        readonly Normals: Float32Array;
        /**
         * Sets the color for each vertex to the referenced material's color and supplies the data to the colorbuffer.
         * @param _materialComponent The materialcomponent attached to the same node.
         */
        applyColor(_materialComponent: ComponentMaterial): void;
        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture was added to.
         */
        setTextureCoordinates(): void;
        /**
         * Computes the normal for each triangle of this mesh and applies it to each of the triangles vertices.
         */
        private computeNormals;
    }
}
declare namespace Fudge {
    /**
     * Class to hold the transformation-data of the mesh that is attached to the same node.
     * The pivot-transformation does not affect the transformation of the node itself or its children.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentPivot extends Component {
        protected matrix: Matrix4x4;
        readonly Matrix: Matrix4x4;
        readonly position: Vector3;
        /**
         * # Transformation methods
         */
        /**
         * Resets this.matrix to idenity Matrix.
         */
        reset(): void;
        /**
         * # Translation methods
         */
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
         * # Rotation methods
         */
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
         * # Scaling methods
         */
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
     * Class to hold the transformation-data of the node it is attached to. Extends PivotComponent for fewer redundancies.
     * Affects the origin of a node and its descendants. Use [[PivotComponent]] to transform only the mesh attached
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends ComponentPivot {
        private worldMatrix;
        constructor();
        WorldMatrix: Matrix4x4;
        readonly WorldPosition: Vector3;
        serialize(): Serialization;
        deserialize(_serialization: Serialization): Serializable;
    }
}
declare namespace Fudge {
    /**
     * Small interface used by Material- and Mesh-classes to store datapullspecifications for a WebGLBuffer.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    interface BufferSpecification {
        size: number;
        dataType: number;
        normalize: boolean;
        stride: number;
        offset: number;
    }
}
declare namespace Fudge {
    class Color {
    }
}
declare namespace Fudge {
    let gl2: WebGL2RenderingContext;
    /**
     * Utility class to sore and/or wrap some functionality.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    abstract class GLUtil {
        /**
         * Sets up canvas and renderingcontext. If no canvasID is passed, a canvas will be created.
         * @param _elementID Optional: ID of a predefined canvaselement.
         */
        static initializeContext(_elementID?: string): HTMLCanvasElement;
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        static attributePointer(_attributeLocation: number, _bufferSpecification: BufferSpecification): void;
        /**
         * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
         * @param _value // value to check against null
         * @param _message // optional, additional message for the exception
         */
        static assert<T>(_value: T | null, _message?: string): T;
        /**
         * Wrapperclass that binds and initializes a texture.
         * @param _textureSource A string containing the path to the texture.
         */
        static createTexture(_textureSource: string): void;
    }
}
declare namespace Fudge {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material {
        private name;
        private shader;
        private positionAttributeLocation;
        private colorAttributeLocation;
        private textureCoordinateAtributeLocation;
        private matrixLocation;
        private color;
        private textureEnabled;
        private textureSource;
        private colorBufferSpecification;
        private textureBufferSpecification;
        constructor(_name: string, _color: Vector3, _shader: Shader);
        readonly Shader: Shader;
        readonly Name: string;
        Color: Vector3;
        readonly ColorBufferSpecification: BufferSpecification;
        readonly TextureBufferSpecification: BufferSpecification;
        readonly TextureEnabled: boolean;
        readonly TextureSource: string;
        readonly PositionAttributeLocation: number;
        readonly ColorAttributeLocation: number;
        readonly MatrixUniformLocation: WebGLUniformLocation;
        readonly TextureCoordinateLocation: number;
        /**
         * Adds and enables a Texture passed to this material.
         * @param _textureSource A string holding the path to the location of the texture.
         */
        addTexture(_textureSource: string): void;
        /**
         * Removes and disables a texture that was added to this material.
         */
        removeTexture(): void;
    }
}
declare namespace Fudge {
    interface MapClassToComponents {
        [className: string]: Component[];
    }
    interface MapStringToNode {
        [key: string]: Node;
    }
    /**
     * Represents a node in the scenetree.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Node implements Serializable {
        name: string;
        private parent;
        private children;
        private components;
        private tags;
        private layers;
        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        constructor(_name: string);
        readonly Parent: Node | null;
        readonly Layers: string[];
        readonly Tags: string[];
        readonly transform: ComponentTransform;
        /**
         * Adds the name of a layer to this nodes layerarray.
         * @param _name The name of the layer to add.
         */
        addLayer(_name: string): void;
        /**
         * Removes the name of a layer from this nodes layerarray.
         * @param _name The name of the layer to remove.
         */
        removeLayer(_name: string): void;
        /**
         * Adds the name of a tag to this nodes tagarray.
         * @param _name The name of the tag to add.
         */
        addTag(_name: string): void;
        /**
         * Removes the name of a tag to this nodes tagarray.
         * @param _name The name of the tag to remove.
         */
        removeTag(_name: string): void;
        /**
         * Returns the children array of this node.
         */
        getChildren(): MapStringToNode;
        /**
         * Looks through this Nodes children array and returns a child with the supplied name.
         * If there are multiple children with the same name in the array, only the first that is found will be returned.
         * Throws error if no child can be found by the supplied name.
         * @param _name The name of the child to be found.
         */
        getChildByName(_name: string): Node;
        /**
         * Adds the supplied child into this nodes children array.
         * Calls setParent method of supplied child with this Node as parameter.
         * @param _child The child to be pushed into the array
         */
        appendChild(_child: Node): void;
        /**
         * Looks through this nodes children array, removes a child with the supplied name and sets the child's parent to undefined.
         * If there are multiple children with the same name in the array, only the first that is found will be removed.
         * Throws error if no child can be found by the name.
         * @param _name The name of the child to be removed.
         */
        removeChild(_name: string): void;
        /**
         * Returns all components of the given class.
         * @param _name The name of the component to be found.
         */
        getComponents(_class: typeof Component): Component[];
        /**
         * Adds the supplied component into the nodes component map.
         * @param _component The component to be pushed into the array.
         */
        addComponent(_component: Component): void;
        /**
         * Looks through this nodes component array, removes a component with the supplied name and sets the components parent to null.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         * @throws Exception when component is not found
         */
        removeComponent(_component: Component): void;
        serialize(): Serialization;
        deserialize(): Serializable;
        /**
         * Sets the parent of this node to be the supplied node. Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        private setParent;
    }
}
declare namespace Fudge {
    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Viewport {
        private name;
        private camera;
        private rootNode;
        private vertexArrayObjects;
        private buffers;
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode
         * @param _camera
         */
        constructor(_name: string, _rootNode: Node, _camera: ComponentCamera);
        readonly Name: string;
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        drawScene(): void;
        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _node The node to initialize.
         */
        initializeViewportNodes(_node: Node): void;
        /**
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph(): void;
        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _node The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        private drawObjects;
        /**
         * Updates the transforms worldmatrix of a passed node for the drawcall and calls this function recursive for all its children.
         * @param _node The node which's transform worldmatrix to update.
         */
        private updateNodeWorldMatrix;
        /**
         * Returns the scenegraph's rootnode for computation of worldmatrices.
         */
        private viewportNodeSceneGraphRoot;
        /**
         * Initializes the vertexbuffer for a passed node.
         * @param _node The node to initialize a buffer for.
         */
        private initializeNodeBuffer;
        /**
         * Initializes the colorbuffer for a node depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        private initializeNodeMaterial;
        /**
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        private initializeNodeTexture;
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        private createSceneGraph;
        /**
         * Updates the displaysize of the passed canvas depending on the client's size and an optional multiplier.
         * Adjusts the viewports camera and the renderingcontexts viewport to fit the canvassize.
         * @param canvas The canvas to readjust.
         * @param multiplier A multiplier to adjust the displayzise dimensions by.
         */
        private updateCanvasDisplaySizeAndCamera;
    }
}
declare namespace Fudge {
    /**
     * Simple class to compute the vertexpositions for a box.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class BoxGeometry {
        private positions;
        constructor(_width: number, _height: number, _depth: number);
        readonly Positions: Float32Array;
    }
}
declare namespace Fudge {
    /**
     * Simple class for 3x3 matrix operations (This class can only handle 2D
     * transformations. Could be removed after applying full 2D compatibility to Mat4).
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Mat3 {
        data: number[];
        constructor();
        static projection(_width: number, _height: number): Mat3;
        readonly Data: number[];
        identity(): Mat3;
        translate(_matrix: Mat3, _xTranslation: number, _yTranslation: number): Mat3;
        rotate(_matrix: Mat3, _angleInDegrees: number): Mat3;
        scale(_matrix: Mat3, _xScale: number, _yscale: number): Mat3;
        multiply(_a: Mat3, _b: Mat3): Mat3;
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
    class Matrix4x4 {
        data: Float32Array;
        constructor();
        static identity(): Matrix4x4;
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
        static centralProjection(_aspect: number, _fieldOfViewInDegrees: number, _near: number, _far: number): Matrix4x4;
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
    /**
     * Abstract superclass for the representation of WebGl shaderprograms.
     * Adjusted version of a class taken from Travis Vromans WebGL 2D-GameEngine
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     * TODO: revisit licensing
     */
    abstract class Shader {
        private program;
        private attributes;
        private uniforms;
        /**
         * Get location of an attribute by its name.
         * @param _name Name of the attribute to locate.
         */
        getAttributeLocation(_name: string): number | null;
        /**
          * Get location of uniform by its name.
          * @param _name Name of the attribute to locate.
          */
        getUniformLocation(_name: string): WebGLUniformLocation | null;
        /**
         * Use this shader in Rendercontext on callup.
         */
        use(): void;
        protected load(_vertexShaderSource: string, _fragmentShaderSource: string): void;
        /**
         * Compiles shader from sourcestring.
         * @param _source The sourcevariable holding a GLSL shaderstring.
         * @param _shaderType The type of the shader to be compiled. (vertex or fragment).
         */
        private compileShader;
        /**
         * Create shaderprogramm that will be used on GPU.
         * @param vertexShader The compiled vertexshader to be used by the programm.
         * @param fragmentShader The compiled fragmentshader to be used by the programm.
         */
        private createProgram;
        /**
         * Iterates through all active attributes on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
         */
        private detectAttributes;
        /**
        * Iterates through all active uniforms on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
        */
        private detectUniforms;
    }
}
declare namespace Fudge {
    /**
     * Represents a WebGL shaderprogram
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderBasic extends Shader {
        constructor();
        private loadVertexShaderSource;
        private loadFragmentShaderSource;
    }
}
declare namespace Fudge {
    /**
     * Represents a WebGL shaderprogram
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderTexture extends Shader {
        constructor();
        private loadVertexShaderSource;
        private loadFragmentShaderSource;
    }
}
