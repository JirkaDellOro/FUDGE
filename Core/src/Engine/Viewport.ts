namespace Fudge {
    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Viewport extends EventTarget {
        private name: string; // The name to call this viewport by.
        private camera: ComponentCamera; // The camera from which's position and view the tree will be rendered.
        private rootNode: Node; // The first node in the tree(branch) that will be rendered.
        private vertexArrayObjects: { [key: string]: WebGLVertexArrayObject } = {}; // Associative array that holds a vertexarrayobject for each node in the tree(branch)
        private buffers: { [key: string]: WebGLBuffer } = {}; // Associative array that holds a buffer for each node in the tree(branch)
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode 
         * @param _camera 
         */
        public constructor(_name: string, _rootNode: Node, _camera: ComponentCamera) {
            super();
            this.name = _name;
            this.rootNode = _rootNode;
            this.camera = _camera;
            this.initializeViewportNodes(this.rootNode);
        }

        public get Name(): string {
            return this.name;
        }

        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        public drawScene(): void {
            if (this.camera.isActive) {
                this.updateCanvasDisplaySizeAndCamera(gl2.canvas);
                let backgroundColor: Vector3 = this.camera.getBackgoundColor();
                gl2.clearColor(backgroundColor.x, backgroundColor.y, backgroundColor.z, this.camera.getBackgroundEnabled() ? 1 : 0);
                gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);
                // Enable backface- and zBuffer-culling.
                gl2.enable(gl2.CULL_FACE);
                gl2.enable(gl2.DEPTH_TEST);
                // TODO: don't do this for each viewport, it needs to be done only once per frame
                this.updateNodeWorldMatrix(this.viewportNodeSceneGraphRoot());
                this.drawObjects(this.rootNode, this.camera.ViewProjectionMatrix);
            }
        }

        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _node The node to initialize.
         */
        public initializeViewportNodes(_node: Node): void {
            if (!_node.cmpTransform) {
                let transform: ComponentTransform = new ComponentTransform();
                _node.addComponent(transform);
            }
            let mesh: ComponentMesh;
            if (!_node.getComponent(ComponentMesh)) {
                console.log(`No Mesh attached to node named '${_node.name})'.`);
            }
            else {
                this.initializeNodeBuffer(_node);
                mesh = <ComponentMesh>_node.getComponent(ComponentMesh);
                gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(mesh.getVertices()), gl2.STATIC_DRAW);
                let materialComponent: ComponentMaterial = <ComponentMaterial>_node.getComponent(ComponentMaterial);

                if (materialComponent) {
                    /*
                    console.log(`No Material attached to node named '${_node.Name}'.`);
                    console.log("Adding standardmaterial...");
                    materialComponent = new MaterialComponent();
                    materialComponent.initialize(AssetManager.getMaterial("standardMaterial"));
                    _node.addComponent(materialComponent);
                    */
                    let positionAttributeLocation: number = materialComponent.Material.PositionAttributeLocation;
                    // uses vertexArrayObject bound in initializeNodeBuffer, implicitely also binding the attribute to the current ARRAY_BUFFER
                    GLUtil.attributePointer(positionAttributeLocation, mesh.getBufferSpecification());
                    this.initializeNodeMaterial(materialComponent, mesh);
                    if (materialComponent.Material.TextureEnabled) {
                        this.initializeNodeTexture(materialComponent, mesh);
                    }
                }
            }
            for (let name in _node.getChildren()) {
                let childNode: Node = _node.getChildren()[name];
                this.initializeViewportNodes(childNode);
            }
        }

        /**
         * Logs this viewports scenegraph to the console.
         */
        public showSceneGraph(): void {
            let output: string = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.rootNode.name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.rootNode));
        }

        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _node The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        private drawObjects(_node: Node, _matrix: Matrix4x4): void {
            let mesh: ComponentMesh = <ComponentMesh>_node.getComponent(ComponentMesh);
            if (mesh) {
                let transform: ComponentTransform = _node.cmpTransform;
                let materialComponent: ComponentMaterial = <ComponentMaterial>_node.getComponent(ComponentMaterial);
                if (materialComponent) {
                    materialComponent.Material.Shader.use();
                    gl2.bindVertexArray(this.vertexArrayObjects[_node.name]);
                    gl2.enableVertexAttribArray(materialComponent.Material.PositionAttributeLocation);
                    // Compute the matrices
                    let transformMatrix: Matrix4x4 = transform.worldMatrix;
                    let pivot: ComponentPivot = <ComponentPivot>_node.getComponent(ComponentPivot);
                    if (pivot)
                        transformMatrix = Matrix4x4.multiply(pivot.Matrix, transform.worldMatrix);
                    let objectViewProjectionMatrix: Matrix4x4 = Matrix4x4.multiply(_matrix, transformMatrix);
                    // Supply matrixdata to shader. 
                    gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.data);
                    // Draw call
                    gl2.drawArrays(gl2.TRIANGLES, mesh.getBufferSpecification().offset, mesh.getVertexCount());
                }
            }
            for (let name in _node.getChildren()) {
                let childNode: Node = _node.getChildren()[name];
                this.drawObjects(childNode, _matrix);
            }
        }
        /**
         * Updates the transforms worldmatrix of a passed node for the drawcall and calls this function recursively for all its children.
         * @param _node The node which's transform worldmatrix to update.
         */
        private updateNodeWorldMatrix(_node: Node, _matrix: Matrix4x4 = Matrix4x4.identity): void {
            let worldMatrix: Matrix4x4 = _matrix;
            let transform: ComponentTransform = _node.cmpTransform;
            if (transform) {
                worldMatrix = Matrix4x4.multiply(_matrix, transform.Matrix);
                transform.worldMatrix = worldMatrix;
            }
            for (let name in _node.getChildren()) {
                let childNode: Node = _node.getChildren()[name];
                this.updateNodeWorldMatrix(childNode, worldMatrix);
            }
        }
        /**
         * Returns the scenegraph's rootnode for computation of worldmatrices.
         */
        private viewportNodeSceneGraphRoot(): Node {
            let sceneGraphRoot: Node = this.rootNode;
            while (sceneGraphRoot.getParent()) {
                sceneGraphRoot = sceneGraphRoot.getParent();
            }
            return sceneGraphRoot;
        }
        /**
         * Initializes a vertexbuffer for every passed node. // TODO: room for optimization when nodes share the same mesh
         * @param _node The node to initialize a buffer for.
         */
        private initializeNodeBuffer(_node: Node): void {
            let bufferCreated: WebGLBuffer | null = gl2.createBuffer();
            if (bufferCreated === null)
                return;
            let buffer: WebGLBuffer = bufferCreated;
            this.buffers[_node.name] = buffer;
            let vertexArrayObjectCreated: WebGLVertexArrayObject | null = gl2.createVertexArray();
            if (vertexArrayObjectCreated === null) return;
            let vertexArrayObject: WebGLVertexArrayObject = vertexArrayObjectCreated;
            this.vertexArrayObjects[_node.name] = vertexArrayObject;
            // bind attribute-array, subsequent calls will use it
            gl2.bindVertexArray(vertexArrayObject);
            // bind buffer to ARRAY_BUFFER, subsequent calls work on it
            gl2.bindBuffer(gl2.ARRAY_BUFFER, buffer);
        }

        /**
         * Initializes the colorbuffer for a node depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        private initializeNodeMaterial(_materialComponent: ComponentMaterial, _meshComponent: ComponentMesh): void {
            let colorBuffer: WebGLBuffer = GLUtil.assert<WebGLBuffer>(gl2.createBuffer());
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            _meshComponent.applyColor(_materialComponent);
            let colorAttributeLocation: number = _materialComponent.Material.ColorAttributeLocation;
            gl2.enableVertexAttribArray(colorAttributeLocation);
            GLUtil.attributePointer(colorAttributeLocation, _materialComponent.Material.ColorBufferSpecification);
        }

        /**
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        private initializeNodeTexture(_materialComponent: ComponentMaterial, _meshComponent: ComponentMesh): void {
            let textureCoordinateAttributeLocation: number = _materialComponent.Material.TextureCoordinateLocation;
            let textureCoordinateBuffer: WebGLBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, textureCoordinateBuffer);
            _meshComponent.setTextureCoordinates();
            gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
            GLUtil.attributePointer(textureCoordinateAttributeLocation, _materialComponent.Material.TextureBufferSpecification);
            GLUtil.createTexture(_materialComponent.Material.TextureSource);
        }

        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        private createSceneGraph(_fudgeNode: Node): string {
            let output: string = "";
            for (let name in _fudgeNode.getChildren()) {
                let child: Node = _fudgeNode.getChildren()[name];
                output += "\n";
                let current: Node = child;
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
        private updateCanvasDisplaySizeAndCamera(canvas: HTMLCanvasElement, multiplier?: number): void {
            multiplier = multiplier || 1;
            let width: number = canvas.clientWidth * multiplier | 0;
            let height: number = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            // TODO: camera should adjust itself to resized canvas by e.g. this.camera.resize(...)
            if (this.camera.isOrthographic)
                this.camera.projectOrthographic(0, width, height, 0);
            else
                this.camera.projectCentral(width / height); //, this.camera.FieldOfView);
            gl2.viewport(0, 0, width, height);
        }
    }
}
