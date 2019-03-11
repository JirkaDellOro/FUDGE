/// <reference types="webgl2" />
declare namespace Fudge {
    /**
     * Superclass for all components that hold data for a sceneobject (i.e. SceneNodes).
     */
    abstract class Component {
        protected name: string;
        protected container: Node | null;
        /**
         * The Superclass' constructor. Values will be overridden by subclass constructors
         * values will be set by the subclass' constructor.
         */
        readonly Name: string;
        Container: Node | null;
    }
}
declare namespace Fudge {
    /**
     * The camera component passes the ability to render a scene from the perspective of the
     * node it is attached to.
     */
    class CameraComponent extends Component {
        private enabled;
        private perspective;
        private projectionMatrix;
        private fieldOfView;
        private backgroundColor;
        private backgroundEnabled;
        constructor(_perspective?: boolean);
        readonly Enabled: boolean;
        enable(): void;
        disable(): void;
        readonly Perspective: boolean;
        readonly FieldOfView: number;
        readonly BackgroundColor: Vec3;
        readonly BackgroundEnabled: boolean;
        enableBackground(): void;
        disableBackground(): void;
        readonly ViewProjectionMatrix: Mat4;
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        setCameraToPerspective(_aspect?: number, _fieldOfView?: number): void;
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        setCameraToOrthographic(_left?: number, _right?: number, _bottom?: number, _top?: number): void;
    }
}
declare namespace Fudge {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    class MaterialComponent extends Component {
        private material;
        constructor(_material: Material);
        readonly Material: Material;
    }
}
declare namespace Fudge {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     */
    class MeshComponent extends Component {
        private positions;
        private vertexCount;
        private bufferSpecification;
        private normals;
        constructor(_positions: Float32Array, _size?: number, _dataType?: number, _normalize?: boolean);
        readonly Positions: Float32Array;
        readonly BufferSpecification: BufferSpecification;
        readonly VertexCount: number;
        readonly Normals: Float32Array;
        /**
         * Computes the normal for each triangle of this meshand applies it to each of the triangles vertices.
         */
        private computeNormals;
        /**
 * Sets the color for each vertex to the referenced material's color and supplies the data to the colorbuffer.
 * @param _materialComponent The materialcomponent attached to the same fudgenode.
 */
        applyColor(_materialComponent: MaterialComponent): void;
        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture
         * was added to.
         */
        setTextureCoordinates(): void;
    }
}
declare namespace Fudge {
    /**
     * Class to hold the transformationdata of the mesh that is attached to the same Node.
     * The pivottransformation does not affect the transformation of the nodes children.
     */
    class PivotComponent extends Component {
        protected matrix: Mat4;
        constructor();
        readonly Matrix: Mat4;
        readonly Position: Vec3;
        /**
         * Resets this.matrix to idenity Matrix.
         */
        reset(): void;
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        translate(_x: number, _y: number, _z: number): void;
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the x-axis.
         * @param _x The value of the translation.
         */
        translateX(_x: number): void;
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the y-axis.
         * @param _y The value of the translation.
         */
        translateY(_y: number): void;
        /**
         * Wrapper function to translate the position of the mesh this pivot is attached to on the z-axis.
         * @param _z The value of the translation.
         */
        translateZ(_z: number): void;
        /**
         * Wrapper function to rotate the mesh this pivot is attached to around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateX(_angle: number): void;
        /**
         * Wrapper function to rotate the mesh this pivot is attached to around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateY(_angle: number): void;
        /**
         * Wrapper function to rotate the mesh this pivot is attached to around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateZ(_zAngle: number): void;
        /**
         * Wrapper function to rotate the mesh of the mesh this pivot is attached to so that its z-Axis is facing in the direction
         * of the targets position.
         * WARNING: This method does not work properly if the mesh that calls it and the target are ancestor/descendant of
         * one another, as it does not take into account the transformation that is passed from one to the other.
         * @param _target The target to look at.
         */
        lookAt(_target: Vec3): void;
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        scale(_xScale: number, _yScale: number, _zScale: number): void;
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the x-axis.
         * @param _scale The value to scale by.
         */
        scaleX(_scale: number): void;
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the y-axis.
         * @param _scale The value to scale by.
         */
        scaleY(_scale: number): void;
        /**
         * Wrapper function to scale the mesh of the node this pivot is attached to on the z-axis.
         * @param _scale The value to scale by.
         */
        scaleZ(_scale: number): void;
    }
}
declare namespace Fudge {
    /**
     * Class to hold the transformationdata of the node it is attached to. Extends Pivot for fewer redundancies.
     * While Pivot only affects the mesh of the node it is attached to, without altering the nodes origin, the
     * Transform component affects the origin of a node and its descendants.
     */
    class TransformComponent extends PivotComponent {
        private worldMatrix;
        constructor();
        WorldMatrix: Mat4;
        readonly WorldPosition: Vec3;
    }
}
declare namespace Fudge {
    /**
     * Class handling all created fudgenodes, viewports and materials.
     */
    abstract class AssetManager {
        private static Nodes;
        private static Viewports;
        private static Materials;
        /**
         * Identifies the passed asset's class and loads it into the fitting array
         * @param _asset
         */
        static addAsset(_asset: any): void;
        /**
         * Looks up the fudgenode with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        static getNode(_name: string): Node;
        /**
         * Returns an object containing all fudgenodes that are currently in the array.
         */
        static getNodes(): Object;
        /**
         * Removes the fudgenode with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteFudgeNode(_name: string): void;
        /**
         * Looks up the viewport with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        static getViewport(_name: string): Viewport;
        /**
         * Returns an object containing all viewports that are currently in the array.
         */
        static getViewports(): Object;
        /**
         * Removes the viewport with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteViewport(_name: string): void;
        /**
         * Looks up the material with the passed name in the array. Returns undefined if there is none
         * @param _name The name to look for.
         */
        static getMaterial(_name: string): Material;
        /**
         * Returns an object containing all materials that are currently in the array.
         */
        static getMaterials(): Object;
        /**
         * Removes the material with the passed name in the array. Throw's error if there is none.
         * @param _name The name to look for.
         */
        static deleteMaterial(_name: string): void;
    }
}
declare namespace Fudge {
    /**
     * Small interface used by Material- and Mesh-classes to store datapullspecifications
     * for a WebGLBuffer.
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
    let gl2: WebGL2RenderingContext;
    /**
     * Utility class to sore and/or wrap some functionality.
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
        static create<T>(_result: T | null): T;
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
        constructor(_name: string, _color: Vec3, _shader: Shader);
        readonly Shader: Shader;
        readonly Name: string;
        Color: Vec3;
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
    interface AssocStringNode {
        [key: string]: Node;
    }
    /**
     * Represents a node in the scenetree.
     */
    class Node {
        private name;
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
        Name: string;
        readonly Parent: Node | null;
        /**
         * Sets the parent of this node to be the supplied node.
         * Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        private setParent;
        readonly Layers: string[];
        readonly Tags: string[];
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
        getChildren(): AssocStringNode;
        /**
         * Looks through this Nodes children array and returns a child with the supplied name.
         * If there are multiple children with the same name in the array, only the first that is found will be returned.
         * Throws error if no child can be found by the supplied name.
         * @param _name The name of the child to be found.
         */
        getChildByName(_name: string): Node;
        /**
         * Adds the supplied child into this nodes children array.
         * Calls setParend method of supplied child with this Node as parameter.
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
         * Returns the component array of this node.
         */
        getComponents(): object;
        /**
         * Looks through this nodes component array and returns a component with the supplied name.
         * If there are multiple components with the same name in the array, only the first that is found will be returned.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        getComponentByName(_name: string): Component | null;
        /**
         * Adds the supplied component into this nodes component array.
         * If there is allready a component by the same name, it will be overridden.
         * @param _component The component to be pushed into the array.
         */
        addComponent(_component: Component): void;
        /**
         * Looks through this nodes ccomponent array, removes a component with the supplied name and sets the components parent to null.
         * If there are multiple components with the same name in the array, only the first that is found will be removed.
         * Throws error if no component can be found by the name.
         * @param _name The name of the component to be found.
         */
        removeComponent(_name: string): void;
    }
}
declare namespace Fudge {
    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
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
        constructor(_name: string, _rootNode: Node, _camera: CameraComponent);
        readonly Name: string;
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        drawScene(): void;
        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _node The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        private drawObjects;
        /**
         * Updates the transforms worldmatrix of a passed node for the drawcall and calls this function recursive for all its children.
         * @param _fudgeNode The node which's transform worldmatrix to update.
         */
        private updateNodeWorldMatrix;
        /**
         * Returns the scenegraph's rootnode for computation of worldmatrices.
         */
        private viewportNodeSceneGraphRoot;
        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _node The node to initialize.
         */
        initializeViewportNodes(_node: Node): void;
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
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph(): void;
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
     */
    class Mat3 {
        data: number[];
        constructor();
        readonly Data: number[];
        identity(): Mat3;
        private translation;
        translate(_matrix: Mat3, _xTranslation: number, _yTranslation: number): Mat3;
        private rotation;
        rotate(_matrix: Mat3, _angleInDegrees: number): Mat3;
        private scaling;
        scale(_matrix: Mat3, _xScale: number, _yscale: number): Mat3;
        multiply(_a: Mat3, _b: Mat3): Mat3;
        static projection(_width: number, _height: number): Mat3;
    }
}
declare namespace Fudge {
    /**
     * Simple class for 4x4 matrix operations.
     */
    class Mat4 {
        private data;
        constructor();
        readonly Data: Float32Array;
        static identity(): Mat4;
        /**
         * Returns a matrix that translates coordinates on the x-, y- and z-axis when multiplied by.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        private static translation;
        /**
         * Wrapper function that multiplies a passed matrix by a translationmatrix with passed x-, y- and z-values.
         * @param _matrix The matrix to multiply.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        static translate(_matrix: Mat4, _xTranslation: number, _yTranslation: number, _zTranslation: number): Mat4;
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        private static xRotation;
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateX(_matrix: Mat4, _angleInDegrees: number): Mat4;
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        private static yRotation;
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateY(_matrix: Mat4, _angleInDegrees: number): Mat4;
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        private static zRotation;
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateZ(_matrix: Mat4, _angleInDegrees: number): Mat4;
        /**
         * Returns a matrix that scales coordinates on the x-, y- and z-axis when multiplied by.
         * @param _x The scaling multiplier for the x-axis.
         * @param _y The scaling multiplier for the y-axis.
         * @param _z The scaling multiplier for the z-axis.
         */
        private static scaling;
        /**
         * Wrapper function that multiplies a passed matrix by a scalingmatrix with passed x-, y- and z-multipliers.
         * @param _matrix The matrix to multiply.
         * @param _x The scaling multiplier for the x-Axis.
         * @param _y The scaling multiplier for the y-Axis.
         * @param _z The scaling multiplier for the z-Axis.
         */
        static scale(_matrix: Mat4, _x: number, _y: number, _z: number): Mat4;
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static multiply(_a: Mat4, _b: Mat4): Mat4;
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _matrix Tha matrix to compute the inverse of.
         */
        static inverse(_matrix: Mat4): Mat4;
        /**
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static lookAt(_transformPosition: Vec3, _targetPosition: Vec3): Mat4;
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace borer on the z-axis.
         */
        static perspective(_aspect: number, _fieldOfViewInDegrees: number, _near: number, _far: number): Mat4;
        /**
         * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         * @param _near The positionvalue of the projectionspace's near border.
         * @param _far The positionvalue of the projectionspace's far border
         */
        static orthographic(_left: number, _right: number, _bottom: number, _top: number, _near?: number, _far?: number): Mat4;
    }
}
declare namespace Fudge {
    class Vec3 {
        private data;
        constructor(_x?: number, _y?: number, _z?: number);
        readonly Data: number[];
        readonly X: number;
        readonly Y: number;
        readonly Z: number;
        static readonly Up: Vec3;
        static readonly Down: Vec3;
        static readonly Forward: Vec3;
        static readonly Backward: Vec3;
        static readonly Right: Vec3;
        static readonly Left: Vec3;
        /**
         * Adds two vectors.
         * @param _a The vector to add to.
         * @param _b The vector to add
         */
        static add(_a: Vec3, _b: Vec3): Vec3;
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         */
        static subtract(_a: Vec3, _b: Vec3): Vec3;
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        static cross(_a: Vec3, _b: Vec3): Vec3;
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        static dot(_a: Vec3, _b: Vec3): number;
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         */
        static normalize(_vector: Vec3): Vec3;
    }
}
declare namespace Fudge {
    /**
     * Abstract superclass for the representation of WebGl shaderprograms.
     * Adjusted version of a class taken from Travis Vromans WebGL 2D-GameEngine
     */
    abstract class Shader {
        private program;
        private attributes;
        private uniforms;
        /**
         * Creates a new shader.
         */
        constructor();
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
        protected load(_vertexShaderSource: string, _fragmentShaderSource: string): void;
        /**
         * Compiles shader from sourcestring.
         * @param _source The sourcevariable holding a GLSL shaderstring.
         * @param _shaderType The type of the shader to be compiled. (vertex or fragment).
         */
        private loadShader;
        /**
         * Create shaderprogramm that will be used on GPU.
         * @param vertexShader The compiled vertexshader to be used by the programm.
         * @param fragmentShader The compiled fragmentshader to be used by the programm.
         */
        private createProgram;
        /**
         * Use this shader in Rendercontext on callup.
         */
        use(): void;
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
     */
    class BasicShader extends Shader {
        constructor();
        private loadVertexShaderSource;
        private loadFragmentShaderSource;
    }
}
