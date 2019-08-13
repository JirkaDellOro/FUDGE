namespace WebEngine {

    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
     */
    export class Viewport {
        private name: string; // The name to call this viewport by.
        private camera: CameraComponent; // The camera from which's position and view the tree will be rendered.
        private rootNode: FudgeNode; // The first node in the tree(branch) that will be rendered.
        private vertexArrayObjects: { [key: string]: WebGLVertexArrayObject } = {}; // Associative array that holds a vertexarrayobject for each node in the tree(branch)
        private buffers: { [key: string]: WebGLBuffer } = {}; // Associative array that holds a buffer for each node in the tree(branch)
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode 
         * @param _camera 
         */
        public constructor(_name: string, _rootNode: FudgeNode, _camera: CameraComponent) {
            this.name = _name;
            this.rootNode = _rootNode;
            this.camera = _camera;
            AssetManager.addAsset(this);
            this.initializeViewportNodes(this.rootNode);
        }

        public get Name(): string {
            return this.name;
        }

        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        public drawScene(): void {
            if (this.camera.Enabled) {
                this.updateCanvasDisplaySizeAndCamera(gl2.canvas);
                gl2.clearColor(this.camera.BackgroundColor.X, this.camera.BackgroundColor.Y, this.camera.BackgroundColor.Z, this.camera.BackgroundEnabled ? 1 : 0);
                gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);
                // Enable backface- and zBuffer-culling.
                gl2.enable(gl2.CULL_FACE);
                gl2.enable(gl2.DEPTH_TEST);
                this.updateNodeWorldMatrix(this.viewportNodeSceneGraphRoot());
                this.drawObjects(this.rootNode, this.camera.ViewProjectionMatrix);
            }
        }

        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _fudgeNode The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        private drawObjects(_fudgeNode: FudgeNode, _matrix: Mat4): void {
            if (_fudgeNode.getComponentByName("Mesh")) {
                let mesh: MeshComponent = <MeshComponent>_fudgeNode.getComponentByName("Mesh");
                let transform = <TransformComponent>_fudgeNode.getComponentByName("Transform");
                let materialComponent: MaterialComponent = <MaterialComponent>_fudgeNode.getComponentByName("Material");
                materialComponent.Material.Shader.use();
                gl2.bindVertexArray(this.vertexArrayObjects[_fudgeNode.Name]);
                gl2.enableVertexAttribArray(materialComponent.Material.PositionAttributeLocation);
                // Compute the matrices
                let transformMatrix: Mat4 = transform.WorldMatrix;
                if (_fudgeNode.getComponentByName("Pivot")) {
                    let pivot = <PivotComponent>_fudgeNode.getComponentByName("Pivot");
                    transformMatrix = Mat4.multiply(pivot.Matrix, transform.WorldMatrix);
                }
                let objectViewProjectionMatrix: Mat4 = Mat4.multiply(_matrix, transformMatrix);
                // Supply matrixdata to shader. 
                gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.Data);
                // Draw call
                gl2.drawArrays(gl2.TRIANGLES, mesh.BufferSpecification.offset, mesh.VertexCount);
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode: FudgeNode = _fudgeNode.getChildren()[name];
                this.drawObjects(childNode, _matrix);
            }
        }
        /**
         * Updates the transforms worldmatrix of a passed node for the drawcall and calls this function recursive for all its children.
         * @param _fudgeNode The node which's transform worldmatrix to update.
         */
        private updateNodeWorldMatrix(_fudgeNode: FudgeNode): void {
            let transform: TransformComponent = <TransformComponent>_fudgeNode.getComponentByName("Transform");
            if (!_fudgeNode.Parent) {
                transform.WorldMatrix = transform.Matrix;
            }
            else {
                let parentTransform: TransformComponent = (<TransformComponent>_fudgeNode.Parent.getComponentByName("Transform"));
                transform.WorldMatrix = Mat4.multiply(parentTransform.WorldMatrix, transform.Matrix);
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode: FudgeNode = _fudgeNode.getChildren()[name];
                this.updateNodeWorldMatrix(childNode);

            }
        }
        /**
         * Returns the scenegraph's rootnode for computation of worldmatrices.
         */
        private viewportNodeSceneGraphRoot(): FudgeNode{
            let sceneGraphRoot : FudgeNode = this.rootNode;
            while(sceneGraphRoot.Parent){
                sceneGraphRoot = sceneGraphRoot.Parent;
            }
            return sceneGraphRoot;
        }
        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _fudgeNode The node to initialize.
         */
        public initializeViewportNodes(_fudgeNode: FudgeNode): void {

            if (!_fudgeNode.getComponentByName("Transform")) {
                let transform = new TransformComponent();
                _fudgeNode.addComponent(transform);
            }
            let mesh: MeshComponent;
            if (_fudgeNode.getComponentByName("Mesh") == undefined) {
                console.log(`No Mesh attached to node named '${_fudgeNode.Name}'.`);
            }
            else {
                this.initializeNodeBuffer(_fudgeNode);
                mesh = <MeshComponent>_fudgeNode.getComponentByName("Mesh");
                gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(mesh.Positions), gl2.STATIC_DRAW);
                let materialComponent: MaterialComponent;
                if (_fudgeNode.getComponentByName("Material") == undefined) {
                    console.log(`No Material attached to node named '${_fudgeNode.Name}'.`);
                    console.log("Adding standardmaterial...");
                    _fudgeNode.addComponent(new MaterialComponent(AssetManager.getMaterial("standardMaterial")));
                }
                materialComponent = <MaterialComponent>_fudgeNode.getComponentByName("Material");
                let positionAttributeLocation = materialComponent.Material.PositionAttributeLocation;
                GLUtil.attributePointer(positionAttributeLocation, mesh.BufferSpecification);
                this.initializeNodeMaterial(materialComponent, mesh);
                if (materialComponent.Material.TextureEnabled) {
                    this.initializeNodeTexture(materialComponent, mesh);
                }
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode: FudgeNode = _fudgeNode.getChildren()[name];
                this.initializeViewportNodes(childNode);
            }
        }


        /**
         * Initializes the vertexbuffer for a passed node.
         * @param _fudgeNode The node to initialize a buffer for.
         */
        private initializeNodeBuffer(_fudgeNode: FudgeNode): void {
            let buffer: WebGLBuffer = gl2.createBuffer();
            this.buffers[_fudgeNode.Name] = buffer;
            let vertexArrayObject: WebGLVertexArrayObject = gl2.createVertexArray();
            this.vertexArrayObjects[_fudgeNode.Name] = vertexArrayObject;
            gl2.bindVertexArray(vertexArrayObject);
            gl2.bindBuffer(gl2.ARRAY_BUFFER, buffer);
        }

        /**
         * Initializes the colorbuffer for a node depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        private initializeNodeMaterial(_materialComponent: MaterialComponent, _meshComponent: MeshComponent): void {
            let colorBuffer: WebGLBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            _meshComponent.applyColor(_materialComponent);
            let colorAttributeLocation = _materialComponent.Material.ColorAttributeLocation;
            gl2.enableVertexAttribArray(colorAttributeLocation);
            GLUtil.attributePointer(colorAttributeLocation, _materialComponent.Material.ColorBufferSpecification);
        }

        /**
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        private initializeNodeTexture(_materialComponent: MaterialComponent, _meshComponent: MeshComponent): void {
            let textureCoordinateAttributeLocation = _materialComponent.Material.TextureCoordinateLocation;
            let textureCoordinateBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, textureCoordinateBuffer);
            _meshComponent.setTextureCoordinates();
            gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
            GLUtil.attributePointer(textureCoordinateAttributeLocation, _materialComponent.Material.TextureBufferSpecification);
            GLUtil.createTexture(_materialComponent.Material.TextureSource);
        }

        /**
         * Logs this viewports scenegraph to the console.
         */
        public showSceneGraph(): void {
            let output: string = "SceneGraph for this viewport:";
            output += "\n \n"
            output += this.rootNode.Name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.rootNode));
        }

        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        private createSceneGraph(_fudgeNode: FudgeNode): string {
            let output: string = "";
            for (let name in _fudgeNode.getChildren()) {
                let child = _fudgeNode.getChildren()[name];
                output += "\n";
                let current = child;
                if (current.Parent.Parent)
                    output += "|";
                while (current.Parent.Parent) {
                    output += "   ";
                    current = current.Parent;
                }
                output += "'--";

                output += child.Name;
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
            let width = canvas.clientWidth * multiplier | 0;
            let height = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            if (this.camera.Perspective) {
                this.camera.setCameraToPerspective(width / height, this.camera.FieldOfView);
            }
            else {
                this.camera.setCameraToOrthographic(0, width, height, 0);
            }
            gl2.viewport(0, 0, width, height);
        }
    } // End class.
} // End namespace.
