"use strict";
var Fudge;
(function (Fudge) {
    class Serializer {
        // TODO: examine, if this class should be placed in another namespace, since calling Fudge[...] there doesn't require the use of 'any'
        // TODO: examine, if the deserialize-Methods of Serializables should be static, returning a new object of the class
        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the Serializable interface
         */
        static serialize(_object) {
            let serialization = {};
            serialization[_object.constructor.name] = _object.serialize();
            return serialization;
        }
        /**
         * Returns a FUDGE-object reconstructed from the information in the serialization-object given,
         * including attached components, children, superclass-objects
         * @param _serialization
         */
        static deserialize(_serialization) {
            let reconstruct;
            try {
                // loop constructed solely to access type-property. Only one expected!
                for (let typeName in _serialization) {
                    reconstruct = new Fudge[typeName];
                    reconstruct.deserialize(_serialization[typeName]);
                    return reconstruct;
                }
            }
            catch (message) {
                throw new Error("Deserialization failed: " + message);
            }
            return null;
        }
    }
    Fudge.Serializer = Serializer;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Base class implementing mutability of instances of subclasses using [[Mutator]]-objects
     * thus providing and using interfaces created at runtime
     */
    class Mutable extends EventTarget {
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
         * @param _mutator
         */
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                types[attribute] = _mutator[attribute].constructor.name;
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
            // for (let attribute in _mutator)
            //     (<General>this)[attribute] = _mutator[attribute];
            // TODO: don't assign unknown properties
            Object.assign(this, _mutator);
            this.dispatchEvent(new Event(Fudge.EVENT.MUTATE));
        }
    }
    Fudge.Mutable = Mutable;
})(Fudge || (Fudge = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var Fudge;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (Fudge) {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Component extends Fudge.Mutable {
        constructor() {
            super(...arguments);
            this.singleton = true;
            this.container = null;
            this.active = true;
        }
        activate(_on) {
            this.active = _on;
        }
        get isActive() {
            return this.active;
        }
        /**
         * Retrieves the type of this components subclass as the name of the runtime class
         * @returns The type of the component
         */
        get type() {
            return this.constructor.name;
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
         * TODO: write tests to prove consistency and correct exception handling
         */
        setContainer(_container) {
            if (this.container == _container)
                return;
            let previousContainer = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                this.container.addComponent(this);
            }
            catch {
                this.container = previousContainer;
            }
        }
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
        }
    }
    Fudge.Component = Component;
})(Fudge || (Fudge = {}));
/// <reference path="Component.ts"/>
var Fudge;
/// <reference path="Component.ts"/>
(function (Fudge) {
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentCamera extends Fudge.Component {
        constructor() {
            super(...arguments);
            this.orthographic = false; // Determines whether the image will be rendered with perspective or orthographic projection.
            this.projectionMatrix = new Fudge.Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
            this.fieldOfView = 45; // The camera's sensorangle.
            this.backgroundColor = new Fudge.Vector3(0, 0, 0); // The color of the background the camera will render.
            this.backgroundEnabled = true; // Determines whether or not the background of this camera will be rendered.
        }
        // TODO: examine, if background should be an attribute of Camera or Viewport
        get isOrthographic() {
            return this.orthographic;
        }
        getBackgoundColor() {
            return this.backgroundColor;
        }
        getBackgroundEnabled() {
            return this.backgroundEnabled;
        }
        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        get ViewProjectionMatrix() {
            try {
                let cmpTransform = this.getContainer().cmpTransform;
                let viewMatrix = Fudge.Matrix4x4.inverse(cmpTransform.Matrix); // TODO: WorldMatrix-> Camera must be calculated
                return Fudge.Matrix4x4.multiply(this.projectionMatrix, viewMatrix);
            }
            catch {
                return this.projectionMatrix;
            }
        }
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        projectCentral(_aspect = Fudge.gl2.canvas.clientWidth / Fudge.gl2.canvas.clientHeight, _fieldOfView = 45) {
            this.fieldOfView = _fieldOfView;
            this.orthographic = false;
            this.projectionMatrix = Fudge.Matrix4x4.centralProjection(_aspect, this.fieldOfView, 1, 2000); // TODO: remove magic numbers
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left = 0, _right = Fudge.gl2.canvas.clientWidth, _bottom = Fudge.gl2.canvas.clientHeight, _top = 0) {
            this.orthographic = true;
            this.projectionMatrix = Fudge.Matrix4x4.orthographicProjection(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }
        serialize() {
            let serialization = {
                backgroundColor: this.backgroundColor,
                backgroundEnabled: this.backgroundEnabled,
                orthographic: this.orthographic,
                fieldOfView: this.fieldOfView,
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.backgroundColor = _serialization.backgroundColor;
            this.backgroundEnabled = _serialization.backgroundEnabled;
            this.orthographic = _serialization.orthographic;
            this.fieldOfView = _serialization.fieldOfView;
            super.deserialize(_serialization[super.constructor.name]);
            if (this.isOrthographic)
                this.projectOrthographic(); // TODO: serialize and deserialize parameters
            else
                this.projectCentral();
            return this;
        }
    }
    Fudge.ComponentCamera = ComponentCamera;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMaterial extends Fudge.Component {
        // TODO: Shader defines material-parameter. Can then the material be independent of the shader? Different structure needed
        initialize(_material) {
            this.material = _material;
        }
        get Material() {
            return this.material;
        }
    }
    Fudge.ComponentMaterial = ComponentMaterial;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends Fudge.Component {
        constructor() {
            super(...arguments);
            this.mesh = null;
        }
        setMesh(_mesh) {
            this.mesh = _mesh;
            this.initialize();
        }
        getMesh() {
            return this.mesh;
        }
        getVertices() {
            return this.vertices;
        }
        getBufferSpecification() {
            return this.bufferSpecification;
        }
        getVertexCount() {
            return this.vertexCount;
        }
        getNormals() {
            return this.normals;
        }
        /**
         * Sets the color for each vertex to the referenced material's color and supplies the data to the colorbuffer.
         * @param _materialComponent The materialcomponent attached to the same node.
         */
        applyColor(_materialComponent) {
            let colorPerPosition = [];
            for (let i = 0; i < this.vertexCount; i++) {
                colorPerPosition.push(_materialComponent.Material.Color.x, _materialComponent.Material.Color.y, _materialComponent.Material.Color.z);
            }
            Fudge.gl2.bufferData(Fudge.gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), Fudge.gl2.STATIC_DRAW);
        }
        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture was added to.
         */
        setTextureCoordinates() {
            let textureCoordinates = [];
            let quadCount = this.vertexCount / 6;
            for (let i = 0; i < quadCount; i++) {
                textureCoordinates.push(0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0);
            }
            Fudge.gl2.bufferData(Fudge.gl2.ARRAY_BUFFER, new Float32Array(textureCoordinates), Fudge.gl2.STATIC_DRAW);
        }
        serialize() {
            let serialization = {
                mesh: this.mesh.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            let mesh = Fudge.Serializer.deserialize(_serialization.mesh);
            this.setMesh(mesh);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        /**
         * Computes the normal for each triangle of this mesh and applies it to each of the triangles vertices.
         */
        computeNormals() {
            let normals = [];
            let normal = new Fudge.Vector3;
            let p = this.vertices;
            for (let i = 0; i < p.length; i += 9) {
                let vector1 = new Fudge.Vector3(p[i + 3] - p[i], p[i + 4] - p[i + 1], p[i + 5] - p[i + 2]);
                let vector2 = new Fudge.Vector3(p[i + 6] - p[i], p[i + 7] - p[i + 1], p[i + 8] - p[i + 2]);
                normal = Fudge.Vector3.normalize(Fudge.Vector3.cross(vector1, vector2));
                normals.push(normal.x, normal.y, normal.z);
                normals.push(normal.x, normal.y, normal.z);
                normals.push(normal.x, normal.y, normal.z);
            }
            return new Float32Array(normals);
        }
        initialize(_size = 3, _dataType = Fudge.gl2.FLOAT, _normalize = false) {
            this.vertices = this.mesh.getVertices();
            this.bufferSpecification = {
                size: _size,
                dataType: _dataType,
                normalize: _normalize,
                stride: 0,
                offset: 0
            };
            this.vertexCount = this.vertices.length / this.bufferSpecification.size;
            if ((this.vertexCount % this.bufferSpecification.size) != 0) {
                console.log(this.vertexCount);
                throw new Error("Number of entries in positions[] and size do not match.");
            }
            this.normals = this.computeNormals();
        }
    }
    Fudge.ComponentMesh = ComponentMesh;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class to hold the transformation-data of the mesh that is attached to the same node.
     * The pivot-transformation does not affect the transformation of the node itself or its children.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentPivot extends Fudge.Component {
        constructor() {
            super(...arguments);
            this.matrix = Fudge.Matrix4x4.identity; // The matrix to transform the mesh by.
            // #endregion
        }
        get Matrix() {
            return this.matrix;
        }
        get position() {
            return new Fudge.Vector3(this.matrix.data[12], this.matrix.data[13], this.matrix.data[14]);
        }
        // #region Transformation
        /**
         * Resets this.matrix to idenity Matrix.
         */
        reset() {
            this.matrix = Fudge.Matrix4x4.identity;
        }
        // #endregion
        // #region Translation
        /**
         * Translate the transformation along the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        translate(_x, _y, _z) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, _x, _y, _z);
        }
        /**
         * Translate the transformation along the x-axis.
         * @param _x The value of the translation.
         */
        translateX(_x) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, _x, 0, 0);
        }
        /**
         * Translate the transformation along the y-axis.
         * @param _y The value of the translation.
         */
        translateY(_y) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, 0, _y, 0);
        }
        /**
         * Translate the transformation along the z-axis.
         * @param _z The value of the translation.
         */
        translateZ(_z) {
            this.matrix = Fudge.Matrix4x4.translate(this.matrix, 0, 0, _z);
        }
        // #endregion
        // #region Rotation
        /**
         * Rotate the transformation along the around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateX(_angle) {
            this.matrix = Fudge.Matrix4x4.rotateX(this.matrix, _angle);
        }
        /**
         * Rotate the transformation along the around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateY(_angle) {
            this.matrix = Fudge.Matrix4x4.rotateY(this.matrix, _angle);
        }
        /**
         * Rotate the transformation along the around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateZ(_zAngle) {
            this.matrix = Fudge.Matrix4x4.rotateZ(this.matrix, _zAngle);
        }
        /**
         * Wrapper function to rotate the transform so that its z-Axis is facing in the direction of the targets position.
         * TODO: Use world transformations! Does it make sense in Pivot?
         * @param _target The target to look at.
         */
        lookAt(_target) {
            this.matrix = Fudge.Matrix4x4.lookAt(this.position, _target); // TODO: Handle rotation around z-axis
        }
        // #endregion
        // #region Scaling
        /**
         * Scale the transformation along the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        scale(_xScale, _yScale, _zScale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, _xScale, _yScale, _zScale);
        }
        /**
         * Scale the transformation along the x-axis.
         * @param _scale The value to scale by.
         */
        scaleX(_scale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, _scale, 1, 1);
        }
        /**
         * Scale the transformation along the y-axis.
         * @param _scale The value to scale by.
         */
        scaleY(_scale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, 1, _scale, 1);
        }
        /**
         * Scale the transformation along the z-axis.
         * @param _scale The value to scale by.
         */
        scaleZ(_scale) {
            this.matrix = Fudge.Matrix4x4.scale(this.matrix, 1, 1, _scale);
        }
        // #endregion
        // #region Seriallization
        serialize() {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization = {
                matrix: this.matrix.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.matrix.deserialize(_serialization.matrix);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    Fudge.ComponentPivot = ComponentPivot;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentScript extends Fudge.Component {
        constructor() {
            super();
            this.singleton = false;
        }
    }
    Fudge.ComponentScript = ComponentScript;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * The transformation-data of the node, extends ComponentPivot for fewer redundancies.
     * Affects the origin of a node and its descendants. Use [[ComponentPivot]] to transform only the mesh attached
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends Fudge.ComponentPivot {
        constructor() {
            super();
            this.worldMatrix = Fudge.Matrix4x4.identity;
        }
        get WorldPosition() {
            return new Fudge.Vector3(this.worldMatrix.data[12], this.worldMatrix.data[13], this.worldMatrix.data[14]);
        }
        serialize() {
            let serialization = {
                // worldMatrix: this.worldMatrix.serialize(),  // is transient, doesn't need to be serialized...     
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            // this.worldMatrix.deserialize(_serialization.worldMatrix);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        mutate(_mutator) {
            super.mutate(_mutator);
        }
        reduceMutator(_mutator) {
            delete _mutator.worldMatrix;
            super.reduceMutator(_mutator);
        }
    }
    Fudge.ComponentTransform = ComponentTransform;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class Color {
    }
    Fudge.Color = Color;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Types of events specific to Fudge, in addition to the standard DOM/Browser-Types and custom strings
     */
    let EVENT;
    (function (EVENT) {
        /** dispatched to targets registered at [[Loop]], when requested animation frame starts */
        EVENT["ANIMATION_FRAME"] = "animationFrame";
        /** dispatched to a [[Component]] when its being added to a [[Node]] */
        EVENT["COMPONENT_ADD"] = "componentAdd";
        /** dispatched to a [[Component]] when its being removed from a [[Node]] */
        EVENT["COMPONENT_REMOVE"] = "componentRemove";
        /** dispatched to a child [[Node]] and its ancestors after it was appended to a parent */
        EVENT["CHILD_APPEND"] = "childAdd";
        /** dispatched to a child [[Node]] and its ancestors just before its being removed from its parent */
        EVENT["CHILD_REMOVE"] = "childRemove";
        /** dispatched to a [[Mutable]] when its being mutated */
        EVENT["MUTATE"] = "mutate";
    })(EVENT = Fudge.EVENT || (Fudge.EVENT = {}));
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
    Fudge.EventTargetStatic = EventTargetStatic;
})(Fudge || (Fudge = {}));
// Just testing new branch pulled in VSCode. This comment shouldn't show in master-branch...
var Fudge;
// Just testing new branch pulled in VSCode. This comment shouldn't show in master-branch...
(function (Fudge) {
    /**
     * Utility class to sore and/or wrap some functionality.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class GLUtil {
        /**
         * Sets up canvas and renderingcontext. If no canvasID is passed, a canvas will be created.
         * @param _elementID Optional: ID of a predefined canvaselement.
         */
        static initializeContext(_elementID) {
            let canvas;
            if (_elementID !== undefined) { // Check if ID was passed. 
                canvas = document.getElementById(_elementID);
                if (canvas === undefined) { // Check if element by passed ID exists. Otherwise throw Error.
                    throw new Error("Cannot find a canvas Element named: " + _elementID);
                }
            }
            else { // If no Canvas ID was passed, create new canvas with default width and height. 
                console.log("Creating new canvas...");
                canvas = document.createElement("canvas");
                canvas.id = "canvas";
                canvas.width = 800;
                canvas.height = 640;
                document.body.appendChild(canvas);
            }
            Fudge.gl2 = GLUtil.assert(canvas.getContext("webgl2"), "WebGL-context couldn't be created");
            return canvas;
        }
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        static attributePointer(_attributeLocation, _bufferSpecification) {
            Fudge.gl2.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }
        /**
         * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
         * @param _value // value to check against null
         * @param _message // optional, additional message for the exception
         */
        static assert(_value, _message = "") {
            if (_value === null)
                throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${Fudge.gl2 ? Fudge.gl2.getError() : ""}`);
            return _value;
        }
        /**
         * Wrapperclass that binds and initializes a texture.
         * @param _textureSource A string containing the path to the texture.
         */
        static createTexture(_textureSource) {
            let texture = GLUtil.assert(Fudge.gl2.createTexture());
            Fudge.gl2.bindTexture(Fudge.gl2.TEXTURE_2D, texture);
            // Fill the texture with a 1x1 blue pixel.
            Fudge.gl2.texImage2D(Fudge.gl2.TEXTURE_2D, 0, Fudge.gl2.RGBA, 1, 1, 0, Fudge.gl2.RGBA, Fudge.gl2.UNSIGNED_BYTE, new Uint8Array([170, 170, 255, 255]));
            // Asynchronously load an image
            let image = new Image();
            image.crossOrigin = "anonymous";
            image.src = _textureSource;
            image.onload = function () {
                Fudge.gl2.bindTexture(Fudge.gl2.TEXTURE_2D, texture);
                Fudge.gl2.texImage2D(Fudge.gl2.TEXTURE_2D, 0, Fudge.gl2.RGBA, Fudge.gl2.RGBA, Fudge.gl2.UNSIGNED_BYTE, image);
                Fudge.gl2.generateMipmap(Fudge.gl2.TEXTURE_2D);
            };
        }
    }
    Fudge.GLUtil = GLUtil;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Core loop of a Fudge application. Initializes automatically and must be startet via Loop.start().
     * it then fires EVENT.ANIMATION_FRAME to all listeners added at each animation frame requested from the host window
     */
    class Loop extends Fudge.EventTargetStatic {
        /**
         * Start the core loop
         */
        static start() {
            if (!Loop.running)
                Loop.loop(performance.now());
            console.log("Loop running");
        }
        static loop(_timestamp) {
            // TODO: do something with timestamp... store in gametime, since there actually is already a timestamp in the event by default
            let event = new Event(Fudge.EVENT.ANIMATION_FRAME);
            Loop.targetStatic.dispatchEvent(event);
            window.requestAnimationFrame(Loop.loop);
        }
    }
    Loop.running = false;
    Fudge.Loop = Loop;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material {
        // TODO: verify the connection of shader and material. The shader actually defines the properties of the material
        constructor(_name, _color, _shader) {
            this.name = _name;
            this.shader = _shader;
            this.positionAttributeLocation = Fudge.GLUtil.assert(this.shader.getAttributeLocation("a_position"));
            this.colorAttributeLocation = Fudge.GLUtil.assert(this.shader.getAttributeLocation("a_color"));
            this.matrixLocation = Fudge.GLUtil.assert(this.shader.getUniformLocation("u_matrix"));
            this.color = _color;
            this.colorBufferSpecification = {
                size: 3,
                dataType: Fudge.gl2.UNSIGNED_BYTE,
                normalize: true,
                stride: 0,
                offset: 0
            };
            this.textureBufferSpecification = {
                size: 2,
                dataType: Fudge.gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0
            };
            this.textureEnabled = false;
            this.textureSource = "";
        }
        // Get methods. ######################################################################################
        get Shader() {
            return this.shader;
        }
        get Name() {
            return this.name;
        }
        get Color() {
            return this.color;
        }
        set Color(_color) {
            this.color = _color;
        }
        get ColorBufferSpecification() {
            return this.colorBufferSpecification;
        }
        get TextureBufferSpecification() {
            return this.textureBufferSpecification;
        }
        get TextureEnabled() {
            return this.textureEnabled;
        }
        get TextureSource() {
            return this.textureSource;
        }
        get PositionAttributeLocation() {
            return this.positionAttributeLocation;
        }
        get ColorAttributeLocation() {
            return this.colorAttributeLocation;
        }
        get MatrixUniformLocation() {
            return this.matrixLocation;
        }
        get TextureCoordinateLocation() {
            return this.textureCoordinateAtributeLocation;
        }
        // Color and Texture methods.######################################################################################
        /**
         * Adds and enables a Texture passed to this material.
         * @param _textureSource A string holding the path to the location of the texture.
         */
        addTexture(_textureSource) {
            this.textureEnabled = true;
            this.textureSource = _textureSource;
            this.textureCoordinateAtributeLocation = Fudge.GLUtil.assert(this.shader.getAttributeLocation("a_textureCoordinate"));
        }
        /**
         * Removes and disables a texture that was added to this material.
         */
        removeTexture() {
            this.textureEnabled = false;
            this.textureSource = "";
        }
    }
    Fudge.Material = Material;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
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
            this.parent = null; // The parent of this node.
            this.children = []; // Associative array nodes appended to this node.
            this.components = {};
            // private tags: string[] = []; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
            // private layers: string[] = []; // Names of the layers this node is on. (TODO: As of yet no functionality)
            this.listeners = {};
            this.captures = {};
            this.name = _name;
        }
        getParent() {
            return this.parent;
        }
        getAncestor() {
            let ancestor = this;
            while (ancestor.getParent())
                ancestor.getParent();
            return ancestor;
        }
        get cmpTransform() {
            return this.getComponents(Fudge.ComponentTransform)[0];
        }
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
            let ancestor = this.parent;
            while (ancestor) {
                if (ancestor == _node)
                    throw (new Error("Cyclic reference prohibited in node hierarchy, ancestors must not be added as children"));
                else
                    ancestor = ancestor.parent;
            }
            this.children.push(_node);
            _node.setParent(this);
            _node.dispatchEvent(new Event(Fudge.EVENT.CHILD_APPEND, { bubbles: true }));
        }
        /**
         * Removes the reference to the give node from the list of children
         * @param _node The node to be removed.
         */
        removeChild(_node) {
            let iFound = this.children.indexOf(_node);
            if (iFound < 0)
                return;
            _node.dispatchEvent(new Event(Fudge.EVENT.CHILD_REMOVE, { bubbles: true }));
            this.children.splice(iFound, 1);
            _node.setParent(null);
        }
        *getBranchGenerator() {
            yield this;
            for (let child of this.children)
                yield* child.branch;
        }
        /**
         * Generator yielding the node and all successors in the branch below for iteration
         */
        get branch() {
            return this.getBranchGenerator();
        }
        // #endregion
        // #region Components
        /**
         * Returns a clone of the list of components of the given class attached this node.
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
            _component.dispatchEvent(new Event(Fudge.EVENT.COMPONENT_ADD));
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
                componentsOfType.splice(foundAt, 1);
                _component.setContainer(null);
                _component.dispatchEvent(new Event(Fudge.EVENT.COMPONENT_REMOVE));
            }
            catch {
                throw new Error(`Unable to find component '${_component}'in node named '${this.name}'`);
            }
        }
        // #endregion
        // #region Serialization
        serialize() {
            let serialization = {
                name: this.name
                // TODO: serialize references, does parent need to be serialized at all?
                //parent: this.parent
            };
            let components = {};
            for (let type in this.components) {
                components[type] = [];
                for (let component of this.components[type]) {
                    components[type].push(component.serialize());
                }
            }
            serialization["components"] = components;
            let children = [];
            for (let child of this.children) {
                children.push(child.serialize());
            }
            serialization["children"] = children;
            return serialization;
        }
        deserialize(_serialization) {
            this.name = _serialization.name;
            // this.parent = is set when the nodes are added
            for (let type in _serialization.components) {
                for (let data of _serialization.components[type]) {
                    let serializedComponent = { [type]: data };
                    let deserializedComponent = Fudge.Serializer.deserialize(serializedComponent);
                    this.addComponent(deserializedComponent);
                }
            }
            for (let child of _serialization.children) {
                let serializedChild = { "Node": child };
                let deserializedChild = Fudge.Serializer.deserialize(serializedChild);
                this.appendChild(deserializedChild);
            }
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
    }
    Fudge.Node = Node;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Viewport extends EventTarget {
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode
         * @param _camera
         */
        constructor(_name, _rootNode, _camera) {
            super();
            this.vertexArrayObjects = {}; // Associative array that holds a vertexarrayobject for each node in the tree(branch)
            this.buffers = {}; // Associative array that holds a buffer for each node in the tree(branch)
            this.name = _name;
            this.rootNode = _rootNode;
            this.camera = _camera;
            this.initializeViewportNodes(this.rootNode);
        }
        get Name() {
            return this.name;
        }
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        drawScene() {
            if (this.camera.isActive) {
                this.updateCanvasDisplaySizeAndCamera(Fudge.gl2.canvas);
                let backgroundColor = this.camera.getBackgoundColor();
                Fudge.gl2.clearColor(backgroundColor.x, backgroundColor.y, backgroundColor.z, this.camera.getBackgroundEnabled() ? 1 : 0);
                Fudge.gl2.clear(Fudge.gl2.COLOR_BUFFER_BIT | Fudge.gl2.DEPTH_BUFFER_BIT);
                // Enable backface- and zBuffer-culling.
                Fudge.gl2.enable(Fudge.gl2.CULL_FACE);
                Fudge.gl2.enable(Fudge.gl2.DEPTH_TEST);
                // TODO: don't do this for each viewport, it needs to be done only once per frame
                this.updateNodeWorldMatrix(this.viewportNodeSceneGraphRoot());
                this.drawObjects(this.rootNode, this.camera.ViewProjectionMatrix);
            }
        }
        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _node The node to initialize.
         */
        initializeViewportNodes(_node) {
            if (!_node.cmpTransform) {
                let transform = new Fudge.ComponentTransform();
                _node.addComponent(transform);
            }
            let mesh;
            if (!_node.getComponent(Fudge.ComponentMesh)) {
                console.log(`No Mesh attached to node named '${_node.name})'.`);
            }
            else {
                this.initializeNodeBuffer(_node);
                mesh = _node.getComponent(Fudge.ComponentMesh);
                Fudge.gl2.bufferData(Fudge.gl2.ARRAY_BUFFER, new Float32Array(mesh.getVertices()), Fudge.gl2.STATIC_DRAW);
                let materialComponent = _node.getComponent(Fudge.ComponentMaterial);
                if (materialComponent) {
                    /*
                    console.log(`No Material attached to node named '${_node.Name}'.`);
                    console.log("Adding standardmaterial...");
                    materialComponent = new MaterialComponent();
                    materialComponent.initialize(AssetManager.getMaterial("standardMaterial"));
                    _node.addComponent(materialComponent);
                    */
                    let positionAttributeLocation = materialComponent.Material.PositionAttributeLocation;
                    // uses vertexArrayObject bound in initializeNodeBuffer, implicitely also binding the attribute to the current ARRAY_BUFFER
                    Fudge.GLUtil.attributePointer(positionAttributeLocation, mesh.getBufferSpecification());
                    this.initializeNodeMaterial(materialComponent, mesh);
                    if (materialComponent.Material.TextureEnabled) {
                        this.initializeNodeTexture(materialComponent, mesh);
                    }
                }
            }
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.initializeViewportNodes(childNode);
            }
        }
        /**
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph() {
            let output = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.rootNode.name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.rootNode));
        }
        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _node The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        drawObjects(_node, _matrix) {
            let mesh = _node.getComponent(Fudge.ComponentMesh);
            if (mesh) {
                let transform = _node.cmpTransform;
                let materialComponent = _node.getComponent(Fudge.ComponentMaterial);
                if (materialComponent) {
                    materialComponent.Material.Shader.use();
                    Fudge.gl2.bindVertexArray(this.vertexArrayObjects[_node.name]);
                    Fudge.gl2.enableVertexAttribArray(materialComponent.Material.PositionAttributeLocation);
                    // Compute the matrices
                    let transformMatrix = transform.worldMatrix;
                    let pivot = _node.getComponent(Fudge.ComponentPivot);
                    if (pivot)
                        transformMatrix = Fudge.Matrix4x4.multiply(pivot.Matrix, transform.worldMatrix);
                    let objectViewProjectionMatrix = Fudge.Matrix4x4.multiply(_matrix, transformMatrix);
                    // Supply matrixdata to shader. 
                    Fudge.gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.data);
                    // Draw call
                    Fudge.gl2.drawArrays(Fudge.gl2.TRIANGLES, mesh.getBufferSpecification().offset, mesh.getVertexCount());
                }
            }
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.drawObjects(childNode, _matrix);
            }
        }
        /**
         * Updates the transforms worldmatrix of a passed node for the drawcall and calls this function recursively for all its children.
         * @param _node The node which's transform worldmatrix to update.
         */
        updateNodeWorldMatrix(_node, _matrix = Fudge.Matrix4x4.identity) {
            let worldMatrix = _matrix;
            let transform = _node.cmpTransform;
            if (transform) {
                worldMatrix = Fudge.Matrix4x4.multiply(_matrix, transform.Matrix);
                transform.worldMatrix = worldMatrix;
            }
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.updateNodeWorldMatrix(childNode, worldMatrix);
            }
        }
        /**
         * Returns the scenegraph's rootnode for computation of worldmatrices.
         */
        viewportNodeSceneGraphRoot() {
            let sceneGraphRoot = this.rootNode;
            while (sceneGraphRoot.getParent()) {
                sceneGraphRoot = sceneGraphRoot.getParent();
            }
            return sceneGraphRoot;
        }
        /**
         * Initializes a vertexbuffer for every passed node. // TODO: room for optimization when nodes share the same mesh
         * @param _node The node to initialize a buffer for.
         */
        initializeNodeBuffer(_node) {
            let bufferCreated = Fudge.gl2.createBuffer();
            if (bufferCreated === null)
                return;
            let buffer = bufferCreated;
            this.buffers[_node.name] = buffer;
            let vertexArrayObjectCreated = Fudge.gl2.createVertexArray();
            if (vertexArrayObjectCreated === null)
                return;
            let vertexArrayObject = vertexArrayObjectCreated;
            this.vertexArrayObjects[_node.name] = vertexArrayObject;
            // bind attribute-array, subsequent calls will use it
            Fudge.gl2.bindVertexArray(vertexArrayObject);
            // bind buffer to ARRAY_BUFFER, subsequent calls work on it
            Fudge.gl2.bindBuffer(Fudge.gl2.ARRAY_BUFFER, buffer);
        }
        /**
         * Initializes the colorbuffer for a node depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        initializeNodeMaterial(_materialComponent, _meshComponent) {
            let colorBuffer = Fudge.GLUtil.assert(Fudge.gl2.createBuffer());
            Fudge.gl2.bindBuffer(Fudge.gl2.ARRAY_BUFFER, colorBuffer);
            _meshComponent.applyColor(_materialComponent);
            let colorAttributeLocation = _materialComponent.Material.ColorAttributeLocation;
            Fudge.gl2.enableVertexAttribArray(colorAttributeLocation);
            Fudge.GLUtil.attributePointer(colorAttributeLocation, _materialComponent.Material.ColorBufferSpecification);
        }
        /**
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        initializeNodeTexture(_materialComponent, _meshComponent) {
            let textureCoordinateAttributeLocation = _materialComponent.Material.TextureCoordinateLocation;
            let textureCoordinateBuffer = Fudge.gl2.createBuffer();
            Fudge.gl2.bindBuffer(Fudge.gl2.ARRAY_BUFFER, textureCoordinateBuffer);
            _meshComponent.setTextureCoordinates();
            Fudge.gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
            Fudge.GLUtil.attributePointer(textureCoordinateAttributeLocation, _materialComponent.Material.TextureBufferSpecification);
            Fudge.GLUtil.createTexture(_materialComponent.Material.TextureSource);
        }
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        createSceneGraph(_fudgeNode) {
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
        /**
         * Updates the displaysize of the passed canvas depending on the client's size and an optional multiplier.
         * Adjusts the viewports camera and the renderingcontexts viewport to fit the canvassize.
         * @param canvas The canvas to readjust.
         * @param multiplier A multiplier to adjust the displayzise dimensions by.
         */
        updateCanvasDisplaySizeAndCamera(canvas, multiplier) {
            multiplier = multiplier || 1;
            let width = canvas.clientWidth * multiplier | 0;
            let height = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            // TODO: camera should adjust itself to resized canvas by e.g. this.camera.resize(...)
            if (this.camera.isOrthographic)
                this.camera.projectOrthographic(0, width, height, 0);
            else
                this.camera.projectCentral(width / height); //, this.camera.FieldOfView);
            Fudge.gl2.viewport(0, 0, width, height);
        }
    }
    Fudge.Viewport = Viewport;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * This class manages the references to the programs, buffers and vertex array objects created and stored with WebGL.
     * Multiple nodes may refer to the same data via their references to shader, material and mesh
     */
    class WebGLReference {
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
     * This class manages the connection of FUDGE to WebGL and the association of [[Nodes]] with the appropriate WebGL data.
     * Nodes to render (refering shaders, meshes and material) must be registered, which creates and associates the necessary references to WebGL buffers and programs.
     * Renders branches of scenetrees to an offscreen buffer, the viewports will copy from there.
     */
    class WebGL {
        // #region Adding
        /**
         * Register the node for rendering. Create a NodeReference for it and increase the matching WebGL references or create them first if necessary
         * @param _node
         */
        static addNode(_node) {
            if (this.nodes.get(_node))
                return;
            /* replaced using generic function, see below. This is here only to look it up and should be deleted soon
            let rfrProgram: Reference<WebGLProgram>;
            rfrProgram = this.programs.get(shader);
            if (rfrProgram)
                rfrProgram.increaseCounter();
            else {
                let program: WebGLProgram = this.createProgram(shader);
                rfrProgram = new Reference<WebGLProgram>(program);
                rfrProgram.increaseCounter();
                this.programs.set(shader, rfrProgram);
            }
            */
            let shader = (_node.getComponent(Fudge.ComponentMaterial)).Material.Shader;
            this.createReference(this.programs, shader, this.createProgram);
            let material = (_node.getComponent(Fudge.ComponentMaterial)).Material;
            this.createReference(this.parameters, material, this.createParameter);
            let mesh = (_node.getComponent(Fudge.ComponentMesh)).getMesh();
            this.createReference(this.buffers, mesh, this.createBuffer);
            let nodeReferences = { shader: shader, material: material, mesh: mesh, doneTransformToWorld: false };
            this.nodes.set(_node, nodeReferences);
        }
        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node
         */
        static addBranch(_node) {
            for (let node of _node.branch)
                this.addNode(node);
        }
        // #endregion
        // #region Removing
        /**
         * Unregister the node so that it won't be rendered any more. Decrease the WebGL references and delete the NodeReferences.
         * @param _node
         */
        static removeNode(_node) {
            let nodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;
            this.removeReference(this.programs, nodeReferences.shader, this.deleteProgram);
            this.removeReference(this.parameters, nodeReferences.material, this.deleteParameter);
            this.removeReference(this.buffers, nodeReferences.mesh, this.deleteBuffer);
            this.nodes.delete(_node);
        }
        /**
         * Unregister the node and its valid successors in the branch to free WebGL resources. Uses [[removeNode]]
         * @param _node
         */
        static removeBranch(_node) {
            for (let node of _node.branch)
                this.removeNode(node);
        }
        // #endregion
        // #region Updating
        /**
         * Reflect changes in the node concerning shader, material and mesh, manage the WebGL references accordingly and update the NodeReferences
         * @param _node
         */
        static updateNode(_node) {
            let nodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;
            let shader = (_node.getComponent(Fudge.ComponentMaterial)).Material.Shader;
            if (shader !== nodeReferences.shader) {
                this.removeReference(this.programs, nodeReferences.shader, this.deleteProgram);
                this.createReference(this.programs, shader, this.createProgram);
                nodeReferences.shader = shader;
            }
            let material = (_node.getComponent(Fudge.ComponentMaterial)).Material;
            if (material !== nodeReferences.material) {
                this.removeReference(this.parameters, nodeReferences.material, this.deleteParameter);
                this.createReference(this.parameters, material, this.createParameter);
                nodeReferences.material = material;
            }
            let mesh = (_node.getComponent(Fudge.ComponentMesh)).getMesh();
            if (mesh !== nodeReferences.mesh) {
                this.removeReference(this.buffers, nodeReferences.mesh, this.deleteBuffer);
                this.createReference(this.buffers, mesh, this.createBuffer);
                nodeReferences.mesh = mesh;
            }
        }
        /**
         * Update the node and its valid successors in the branch using [[updateNode]]
         * @param _node
         */
        static updateBranch(_node) {
            for (let node of _node.branch)
                this.updateNode(node);
        }
        // #endregion
        // #region Transformation & Rendering
        /**
         * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
         */
        static recalculateAllNodeTransforms() {
            // inner function to be called in a for each node at the bottom of this function
            function markNodeToBeTransformed(_nodeReferences, _node, _map) {
                _nodeReferences.doneTransformToWorld = false;
            }
            // inner function to be called in a for each node at the bottom of this function
            let recalculateBranchContainingNode = (_nodeReferences, _node, _map) => {
                if (_nodeReferences.doneTransformToWorld)
                    return;
                _nodeReferences.doneTransformToWorld = true;
                // find uppermost ancestor not recalculated yet
                let ancestor = _node;
                let parent;
                while (true) {
                    parent = ancestor.getParent();
                    if (!parent)
                        break;
                    let parentReferences = _map.get(parent);
                    if (parentReferences && parentReferences.doneTransformToWorld)
                        break;
                    ancestor = parent;
                }
                // use the ancestors parent world matrix to start with, or identity if no parent exists or it's missing a ComponenTransform
                let matrix = Fudge.Matrix4x4.identity;
                if (parent && parent.cmpTransform)
                    matrix = parent.cmpTransform.worldMatrix;
                // start recursive recalculation of the whole branch starting from the ancestor found
                this.recalculateTransformsOfNodeAndChildren(ancestor, matrix);
            };
            // call the functions above for each registered node
            this.nodes.forEach(markNodeToBeTransformed);
            this.nodes.forEach(recalculateBranchContainingNode);
        }
        /**
         * Draws the branch starting with the given [[Node]] using the projection matrix given as _cameraMatrix.
         * If the node lacks a [[ComponentTransform]], respectively a worldMatrix, the matrix given as _matrix will be used to transform the node
         * or the identity matrix, if _matrix is null.
         * @param _node
         * @param _cameraMatrix
         * @param _matrix
         */
        static drawBranch(_node, _cameraMatrix, _matrix) {
            let references = this.nodes.get(_node);
            this.useProgram(this.programs.get(references.shader));
            this.useParameter(this.parameters.get(references.material));
            this.useBuffer(this.programs.get(references.shader));
            let cmpTransform = _node.cmpTransform;
            let transformMatrix = _matrix;
            if (cmpTransform)
                transformMatrix = cmpTransform.worldMatrix;
            if (!transformMatrix)
                transformMatrix = Fudge.Matrix4x4.identity;
            let pivot = _node.getComponent(Fudge.ComponentPivot);
            if (pivot)
                transformMatrix = Fudge.Matrix4x4.multiply(pivot.Matrix, transformMatrix);
            // multiply camera matrix
            // let objectViewProjectionMatrix: Matrix4x4 = Matrix4x4.multiply(_cameraMatrix, transformMatrix);
            // Supply matrixdata to shader. 
            //gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.data);
            // Draw call
            //gl2.drawArrays(gl2.TRIANGLES, mesh.getBufferSpecification().offset, mesh.getVertexCount());
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.drawBranch(childNode, _cameraMatrix, transformMatrix);
            }
        }
        /**
         * Recursive method receiving a childnode and its parents updated world transform.
         * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
         * @param _node
         * @param _matrix
         */
        static recalculateTransformsOfNodeAndChildren(_node, _matrix = Fudge.Matrix4x4.identity) {
            let worldMatrix = _matrix;
            let transform = _node.cmpTransform;
            if (transform) {
                worldMatrix = Fudge.Matrix4x4.multiply(_matrix, transform.Matrix);
                transform.worldMatrix = worldMatrix;
            }
            for (let child of _node.getChildren()) {
                this.recalculateTransformsOfNodeAndChildren(child, worldMatrix);
            }
        }
        // #endregion
        // #region Manage references to WebGL-Data
        /**
         * Removes a WebGL reference to a program, parameter or buffer by decreasing its reference counter and deleting it, if the counter reaches 0
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
                _deletor(reference);
                _in.delete(_key);
            }
        }
        /**
         * Increases the counter of WebGL reference to a program, parameter or buffer. Creates the reference, if it's not existent.
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
                reference = new WebGLReference(content);
                reference.increaseCounter();
                _in.set(_key, reference);
            }
        }
        // #endregion
        // #region Dummy-Methods
        static createProgram(_shader) {
            // return new WebGLProgram();
            return "Program";
        }
        static createParameter(_material) {
            // return new WebGLVertexArrayObject();
            return "VAO";
        }
        static createBuffer(_mesh) {
            // return new WebGLBuffer();
            return "Buffer";
        }
        static deleteProgram(_program) {
            // to be implemented;
        }
        static deleteParameter(_parameter) {
            // to be implemented;
        }
        static deleteBuffer(_buffer) {
            // to be implemented;
        }
        static useProgram(_program) {
            // to be implemented;
        }
        static useParameter(_parameter) {
            // to be implemented;
        }
        static useBuffer(_buffer) {
            // to be implemented;
        }
    }
    // private canvas: HTMLCanvasElement; //offscreen render buffer
    // private crc3: WebGL2RenderingContext;
    /** Stores references to the compiled shader programs and makes them available via the references to shaders */
    WebGL.programs = new Map();
    /** Stores references to the vertex array objects and makes them available via the references to materials */
    WebGL.parameters = new Map();
    /** Stores references to the vertex buffers and makes them available via the references to meshes */
    WebGL.buffers = new Map();
    WebGL.nodes = new Map();
    Fudge.WebGL = WebGL;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
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
    Fudge.Matrix3x3 = Matrix3x3;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Simple class for 4x4 transformation matrix operations.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix4x4 extends Fudge.Mutable {
        constructor() {
            super();
            this.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
        // Transformation methods.######################################################################################
        static get identity() {
            return new Matrix4x4;
        }
        /**
         * Wrapper function that multiplies a passed matrix by a scalingmatrix with passed x-, y- and z-multipliers.
         * @param _matrix The matrix to multiply.
         * @param _x The scaling multiplier for the x-Axis.
         * @param _y The scaling multiplier for the y-Axis.
         * @param _z The scaling multiplier for the z-Axis.
         */
        static scale(_matrix, _x, _y, _z) {
            return Matrix4x4.multiply(_matrix, this.scaling(_x, _y, _z));
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static multiply(_a, _b) {
            let matrix = new Matrix4x4();
            let a00 = _a.data[0 * 4 + 0];
            let a01 = _a.data[0 * 4 + 1];
            let a02 = _a.data[0 * 4 + 2];
            let a03 = _a.data[0 * 4 + 3];
            let a10 = _a.data[1 * 4 + 0];
            let a11 = _a.data[1 * 4 + 1];
            let a12 = _a.data[1 * 4 + 2];
            let a13 = _a.data[1 * 4 + 3];
            let a20 = _a.data[2 * 4 + 0];
            let a21 = _a.data[2 * 4 + 1];
            let a22 = _a.data[2 * 4 + 2];
            let a23 = _a.data[2 * 4 + 3];
            let a30 = _a.data[3 * 4 + 0];
            let a31 = _a.data[3 * 4 + 1];
            let a32 = _a.data[3 * 4 + 2];
            let a33 = _a.data[3 * 4 + 3];
            let b00 = _b.data[0 * 4 + 0];
            let b01 = _b.data[0 * 4 + 1];
            let b02 = _b.data[0 * 4 + 2];
            let b03 = _b.data[0 * 4 + 3];
            let b10 = _b.data[1 * 4 + 0];
            let b11 = _b.data[1 * 4 + 1];
            let b12 = _b.data[1 * 4 + 2];
            let b13 = _b.data[1 * 4 + 3];
            let b20 = _b.data[2 * 4 + 0];
            let b21 = _b.data[2 * 4 + 1];
            let b22 = _b.data[2 * 4 + 2];
            let b23 = _b.data[2 * 4 + 3];
            let b30 = _b.data[3 * 4 + 0];
            let b31 = _b.data[3 * 4 + 1];
            let b32 = _b.data[3 * 4 + 2];
            let b33 = _b.data[3 * 4 + 3];
            matrix.data = new Float32Array([
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
         * @param _matrix Tha matrix to compute the inverse of.
         */
        static inverse(_matrix) {
            let m00 = _matrix.data[0 * 4 + 0];
            let m01 = _matrix.data[0 * 4 + 1];
            let m02 = _matrix.data[0 * 4 + 2];
            let m03 = _matrix.data[0 * 4 + 3];
            let m10 = _matrix.data[1 * 4 + 0];
            let m11 = _matrix.data[1 * 4 + 1];
            let m12 = _matrix.data[1 * 4 + 2];
            let m13 = _matrix.data[1 * 4 + 3];
            let m20 = _matrix.data[2 * 4 + 0];
            let m21 = _matrix.data[2 * 4 + 1];
            let m22 = _matrix.data[2 * 4 + 2];
            let m23 = _matrix.data[2 * 4 + 3];
            let m30 = _matrix.data[3 * 4 + 0];
            let m31 = _matrix.data[3 * 4 + 1];
            let m32 = _matrix.data[3 * 4 + 2];
            let m33 = _matrix.data[3 * 4 + 3];
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
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
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
        static lookAt(_transformPosition, _targetPosition) {
            let matrix = new Matrix4x4;
            let transformPosition = new Fudge.Vector3(_transformPosition.x, _transformPosition.y, _transformPosition.z);
            let targetPosition = new Fudge.Vector3(_targetPosition.x, _targetPosition.y, _targetPosition.z);
            let zAxis = Fudge.Vector3.subtract(transformPosition, targetPosition);
            zAxis = Fudge.Vector3.normalize(zAxis);
            let xAxis;
            let yAxis;
            if (zAxis.Data != Fudge.Vector3.up.Data) { // TODO: verify intention - this is the comparison of references...
                xAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(Fudge.Vector3.up, zAxis));
                yAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(zAxis, xAxis));
            }
            else {
                xAxis = Fudge.Vector3.normalize(Fudge.Vector3.subtract(transformPosition, targetPosition));
                yAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(Fudge.Vector3.forward, xAxis));
                zAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(xAxis, yAxis));
            }
            matrix.data = new Float32Array([
                xAxis.x, xAxis.y, xAxis.z, 0,
                yAxis.x, yAxis.y, yAxis.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                transformPosition.x,
                transformPosition.y,
                transformPosition.z,
                1
            ]);
            return matrix;
        }
        // Projection methods.######################################################################################
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace borer on the z-axis.
         */
        static centralProjection(_aspect, _fieldOfViewInDegrees, _near, _far) {
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
            let rangeInv = 1.0 / (_near - _far);
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                f / _aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0
            ]);
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
        static orthographicProjection(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
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
        /**
        * Wrapper function that multiplies a passed matrix by a translationmatrix with passed x-, y- and z-values.
        * @param _matrix The matrix to multiply.
        * @param _xTranslation The x-value of the translation.
        * @param _yTranslation The y-value of the translation.
        * @param _zTranslation The z-value of the translation.
        */
        static translate(_matrix, _xTranslation, _yTranslation, _zTranslation) {
            return Matrix4x4.multiply(_matrix, this.translation(_xTranslation, _yTranslation, _zTranslation));
        }
        /**
        * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
        * @param _matrix The matrix to multiply.
        * @param _angleInDegrees The angle to rotate by.
        */
        static rotateX(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.xRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateY(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.yRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateZ(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.zRotation(_angleInDegrees));
        }
        // Translation methods.######################################################################################
        /**
         * Returns a matrix that translates coordinates on the x-, y- and z-axis when multiplied by.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        static translation(_xTranslation, _yTranslation, _zTranslation) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _xTranslation, _yTranslation, _zTranslation, 1
            ]);
            return matrix;
        }
        // Rotation methods.######################################################################################
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static xRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
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
        static yRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
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
        static zRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        // Scaling methods.######################################################################################
        /**
         * Returns a matrix that scales coordinates on the x-, y- and z-axis when multiplied by.
         * @param _x The scaling multiplier for the x-axis.
         * @param _y The scaling multiplier for the y-axis.
         * @param _z The scaling multiplier for the z-axis.
         */
        static scaling(_x, _y, _z) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                _x, 0, 0, 0,
                0, _y, 0, 0,
                0, 0, _z, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        serialize() {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization = {
                data: Array.from(this.data)
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.data = new Float32Array(_serialization.data);
            return this;
        }
        getMutator() {
            let mutator = {
                data: Object.assign({}, this.data)
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    Fudge.Matrix4x4 = Matrix4x4;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class storing and manipulating a threedimensional vector
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector3 {
        constructor(_x = 0, _y = 0, _z = 0) {
            this.data = [_x, _y, _z];
        }
        // TODO: implement equals-functions
        // Get methods.######################################################################################
        get Data() {
            return this.data;
        }
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        get z() {
            return this.data[2];
        }
        /**
         * The up-Vector (0, 1, 0)
         */
        static get up() {
            let vector = new Vector3(0, 1, 0);
            return vector;
        }
        /**
         * The down-Vector (0, -1, 0)
         */
        static get down() {
            let vector = new Vector3(0, -1, 0);
            return vector;
        }
        /**
         * The forward-Vector (0, 0, 1)
         */
        static get forward() {
            let vector = new Vector3(0, 0, 1);
            return vector;
        }
        /**
         * The backward-Vector (0, 0, -1)
         */
        static get backward() {
            let vector = new Vector3(0, 0, -1);
            return vector;
        }
        /**
         * The right-Vector (1, 0, 0)
         */
        static get right() {
            let vector = new Vector3(1, 0, 0);
            return vector;
        }
        /**
         * The left-Vector (-1, 0, 0)
         */
        static get left() {
            let vector = new Vector3(-1, 0, 0);
            return vector;
        }
        // Vectormath methods.######################################################################################
        /**
         * Adds two vectors.
         * @param _a The first vector to add
         * @param _b The second vector to add
         * @returns A new vector representing the sum of the given vectors
         */
        static add(_a, _b) {
            let vector = new Vector3;
            vector.data = [_a.x + _b.x, _a.y + _b.y, _a.z + _b.z];
            return vector;
        }
        /**
        * Sums up multiple vectors.
        * @param _a The first vector to add
        * @param _b The second vector to add
        * @returns A new vector representing the sum of the given vectors
        */
        static sum(..._vectors) {
            let result = new Vector3();
            for (let vector of _vectors)
                result.data = [result.x + vector.x, result.y + vector.y, result.z + vector.z];
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static subtract(_a, _b) {
            let vector = new Vector3;
            vector.data = [_a.x - _b.x, _a.y - _b.y, _a.z - _b.z];
            return vector;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the crossproduct of the given vectors
         */
        static cross(_a, _b) {
            let vector = new Vector3;
            vector.data = [
                _a.y * _b.z - _a.z * _b.y,
                _a.z * _b.x - _a.x * _b.z,
                _a.x * _b.y - _a.y * _b.x
            ];
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static dot(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         * @returns A new vector representing the given vector scaled to the length of 1
         */
        static normalize(_vector) {
            let length = Math.sqrt(_vector.x * _vector.x + _vector.y * _vector.y + _vector.z * _vector.z);
            let vector = new Vector3;
            // make sure we don't divide by 0. TODO: see if it's appropriate to use try/catch here
            if (length > 0.00001) {
                vector.data = [_vector.x / length, _vector.y / length, _vector.z / length];
            }
            else {
                vector.data = [0, 0, 0];
            }
            return vector;
        }
    }
    Fudge.Vector3 = Vector3;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Simple class to compute the vertexpositions for a box.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshCube {
        constructor(_width, _height, _depth) {
            this.width = _width;
            this.height = _height;
            this.depth = _depth;
        }
        getVertices() {
            let vertices = new Float32Array([
                //front
                -1, -1, 1, /**/ 1, -1, 1, /**/ -1, 1, 1, /**/ -1, 1, 1, /**/ 1, -1, 1, /**/ 1, 1, 1,
                //back
                1, -1, -1, /**/ -1, -1, -1, /**/ 1, 1, -1, /**/ 1, 1, -1, /**/ -1, -1, -1, /**/ -1, 1, -1,
                //left
                -1, -1, -1, /**/ -1, -1, 1, /**/ -1, 1, -1, /**/ -1, 1, -1, /**/ -1, -1, 1, /**/ -1, 1, 1,
                //right
                1, -1, 1, /**/ 1, -1, -1, /**/ 1, 1, 1, /**/ 1, 1, 1, /**/ 1, -1, -1, /**/ 1, 1, -1,
                //top
                -1, 1, 1, /**/ 1, 1, 1, /**/ -1, 1, -1, /**/ -1, 1, -1, /**/ 1, 1, 1, /**/ 1, 1, -1,
                //bottom
                -1, -1, -1, /**/ 1, -1, -1, /**/ -1, -1, 1, /**/ -1, -1, 1, /**/ 1, -1, -1, /**/ 1, -1, 1
            ]);
            for (let iVertex = 0; iVertex < vertices.length; iVertex += 3) {
                vertices[iVertex] *= this.width / 2;
                vertices[iVertex + 1] *= this.height / 2;
                vertices[iVertex + 2] *= this.depth / 2;
            }
            return vertices;
        }
        serialize() {
            let serialization = {};
            serialization[this.constructor.name] = this;
            return serialization;
        }
        deserialize(_serialization) {
            this.width = _serialization.width;
            this.height = _serialization.height;
            this.depth = _serialization.depth;
            return this;
        }
    }
    Fudge.MeshCube = MeshCube;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Abstract superclass for the representation of WebGl shaderprograms.
     * Adjusted version of a class taken from Travis Vromans WebGL 2D-GameEngine
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     * TODO: revisit licensing
     */
    class Shader {
        constructor() {
            this.attributes = {}; // Associative array of shader atrributes.
            this.uniforms = {}; // Associative array of shader uniforms.
        }
        // Get and set methods.######################################################################################
        /**
         * Get location of an attribute by its name.
         * @param _name Name of the attribute to locate.
         */
        getAttributeLocation(_name) {
            if (this.attributes[_name] === undefined) {
                return null;
            }
            return this.attributes[_name];
        }
        /**
          * Get location of uniform by its name.
          * @param _name Name of the attribute to locate.
          */
        getUniformLocation(_name) {
            if (this.uniforms[_name] === undefined) {
                return null;
            }
            return this.uniforms[_name];
        }
        /**
         * Use this shader in Rendercontext on callup.
         */
        use() {
            Fudge.gl2.useProgram(this.program);
        }
        load(_vertexShaderSource, _fragmentShaderSource) {
            let vertexShader = Fudge.GLUtil.assert(this.compileShader(_vertexShaderSource, Fudge.gl2.VERTEX_SHADER));
            let fragmentShader = Fudge.GLUtil.assert(this.compileShader(_fragmentShaderSource, Fudge.gl2.FRAGMENT_SHADER));
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
        }
        // Utility methods.######################################################################################
        /**
         * Compiles shader from sourcestring.
         * @param _source The sourcevariable holding a GLSL shaderstring.
         * @param _shaderType The type of the shader to be compiled. (vertex or fragment).
         */
        compileShader(_source, _shaderType) {
            let shader = Fudge.GLUtil.assert(Fudge.gl2.createShader(_shaderType));
            Fudge.gl2.shaderSource(shader, _source);
            Fudge.gl2.compileShader(shader);
            let error = Fudge.GLUtil.assert(Fudge.gl2.getShaderInfoLog(shader));
            if (error !== "") {
                throw new Error("Error compiling shader: " + error);
            }
            // Check for any compilation errors.
            if (!Fudge.gl2.getShaderParameter(shader, Fudge.gl2.COMPILE_STATUS)) {
                alert(Fudge.gl2.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        /**
         * Create shaderprogramm that will be used on GPU.
         * @param vertexShader The compiled vertexshader to be used by the programm.
         * @param fragmentShader The compiled fragmentshader to be used by the programm.
         */
        createProgram(vertexShader, fragmentShader) {
            this.program = Fudge.GLUtil.assert(Fudge.gl2.createProgram());
            Fudge.gl2.attachShader(this.program, vertexShader);
            Fudge.gl2.attachShader(this.program, fragmentShader);
            Fudge.gl2.linkProgram(this.program);
            let error = Fudge.gl2.getProgramInfoLog(this.program);
            if (error !== "") {
                throw new Error("Error linking Shader: " + error);
            }
        }
        /**
         * Iterates through all active attributes on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
         */
        detectAttributes() {
            let attributeCount = Fudge.gl2.getProgramParameter(this.program, Fudge.gl2.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < attributeCount; i++) {
                let attributeInfo = Fudge.GLUtil.assert(Fudge.gl2.getActiveAttrib(this.program, i));
                if (!attributeInfo) {
                    break;
                }
                this.attributes[attributeInfo.name] = Fudge.gl2.getAttribLocation(this.program, attributeInfo.name);
            }
        }
        /**
        * Iterates through all active uniforms on an instance of shader and saves them in an associative array with the attribute's name as key and the location as value
        */
        detectUniforms() {
            let uniformCount = Fudge.gl2.getProgramParameter(this.program, Fudge.gl2.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let info = Fudge.GLUtil.assert(Fudge.gl2.getActiveUniform(this.program, i));
                if (!info) {
                    break;
                }
                this.uniforms[info.name] = Fudge.GLUtil.assert(Fudge.gl2.getUniformLocation(this.program, info.name));
            }
        }
    }
    Fudge.Shader = Shader;
})(Fudge || (Fudge = {}));
/// <reference path="Shader.ts"/>
var Fudge;
/// <reference path="Shader.ts"/>
(function (Fudge) {
    /**
     * Represents a WebGL shaderprogram
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderBasic extends Fudge.Shader {
        constructor() {
            super();
            this.load(this.loadVertexShaderSource(), this.loadFragmentShaderSource());
        }
        loadVertexShaderSource() {
            return `#version 300 es
                    // an attribute is an input (in) to a vertex shader.
                    // It will receive data from a buffer
                    in vec4 a_position;
                    in vec4 a_color;
                
                    // The Matrix to transform the positions by.
                    uniform mat4 u_matrix;
                
                    // Varying color in the fragmentshader.
                    out vec4 v_color;
                
                    // all shaders have a main function.
                    void main() {  
                        // Multiply all positions by the matrix.   
                        vec4 position = u_matrix * a_position;
                        
                        gl_Position = u_matrix * a_position;
                
                        // Pass color to fragmentshader.
                        v_color = a_color;
                    }`;
        }
        loadFragmentShaderSource() {
            return `#version 300 es
                    // fragment shaders don't have a default precision so we need to pick one. mediump is a good default. It means "medium precision"
                    precision mediump float;
                    
                    // Color passed from vertexshader.
                    in vec4 v_color;
                
                    // we need to declare an output for the fragment shader
                    out vec4 outColor;
                    
                    void main() {
                       outColor = v_color;
                    }`;
        }
    }
    Fudge.ShaderBasic = ShaderBasic;
})(Fudge || (Fudge = {}));
/// <reference path="Shader.ts"/>
var Fudge;
/// <reference path="Shader.ts"/>
(function (Fudge) {
    /**
     * Represents a WebGL shaderprogram
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderTexture extends Fudge.Shader {
        constructor() {
            super();
            this.load(this.loadVertexShaderSource(), this.loadFragmentShaderSource());
        }
        loadVertexShaderSource() {
            return `#version 300 es
 
                    // an attribute is an input (in) to a vertex shader.
                    // It will receive data from a buffer
                    in vec4 a_position;
                    in vec4 a_color;
                    in vec2 a_textureCoordinate;
                
                    // The Matrix to transform the positions by.
                    uniform mat4 u_matrix;
                
                
                    // Varying color in the fragmentshader.
                    out vec4 v_color;
                    // Varying texture in the fragmentshader.
                    out vec2 v_textureCoordinate;
                
                
                    // all shaders have a main function.
                    void main() {  
                        // Multiply all positions by the matrix.   
                        vec4 position = u_matrix * a_position;
                
                
                        gl_Position = u_matrix * a_position;
                
                        // Pass color to fragmentshader.
                        v_color = a_color;
                        v_textureCoordinate = a_textureCoordinate;
                    }`;
        }
        loadFragmentShaderSource() {
            return `#version 300 es
            
                    // fragment shaders don't have a default precision so we need
                    // to pick one. mediump is a good default. It means "medium precision"
                    precision mediump float;
                    
                    // Color passed from vertexshader.
                    in vec4 v_color;
                    // Texture passed from vertexshader.
                    in vec2 v_textureCoordinate;
                
                
                    uniform sampler2D u_texture;
                    // we need to declare an output for the fragment shader
                    out vec4 outColor;
                    
                    void main() {
                    outColor = v_color;
                    outColor = texture(u_texture, v_textureCoordinate) * v_color;
            }`;
        }
    }
    Fudge.ShaderTexture = ShaderTexture;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map