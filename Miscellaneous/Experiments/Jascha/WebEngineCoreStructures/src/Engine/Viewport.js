var WebEngine;
(function (WebEngine) {
    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
     */
    class Viewport {
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode
         * @param _camera
         */
        constructor(_name, _rootNode, _camera) {
            this.vertexArrayObjects = {}; // Associative array that holds a vertexarrayobject for each node in the tree(branch)
            this.buffers = {}; // Associative array that holds a buffer for each node in the tree(branch)
            this.name = _name;
            this.rootNode = _rootNode;
            this.camera = _camera;
            WebEngine.AssetManager.addAsset(this);
            this.initializeViewportNodes(this.rootNode);
        }
        get Name() {
            return this.name;
        }
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        drawScene() {
            if (this.camera.Enabled) {
                this.updateCanvasDisplaySizeAndCamera(WebEngine.gl2.canvas);
                WebEngine.gl2.clearColor(this.camera.BackgroundColor.X, this.camera.BackgroundColor.Y, this.camera.BackgroundColor.Z, this.camera.BackgroundEnabled ? 1 : 0);
                WebEngine.gl2.clear(WebEngine.gl2.COLOR_BUFFER_BIT | WebEngine.gl2.DEPTH_BUFFER_BIT);
                // Enable backface- and zBuffer-culling.
                WebEngine.gl2.enable(WebEngine.gl2.CULL_FACE);
                WebEngine.gl2.enable(WebEngine.gl2.DEPTH_TEST);
                this.updateNodeWorldMatrix(this.viewportNodeSceneGraphRoot());
                this.drawObjects(this.rootNode, this.camera.ViewProjectionMatrix);
            }
        }
        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _fudgeNode The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        drawObjects(_fudgeNode, _matrix) {
            if (_fudgeNode.getComponentByName("Mesh")) {
                let mesh = _fudgeNode.getComponentByName("Mesh");
                let transform = _fudgeNode.getComponentByName("Transform");
                let materialComponent = _fudgeNode.getComponentByName("Material");
                materialComponent.Material.Shader.use();
                WebEngine.gl2.bindVertexArray(this.vertexArrayObjects[_fudgeNode.Name]);
                WebEngine.gl2.enableVertexAttribArray(materialComponent.Material.PositionAttributeLocation);
                // Compute the matrices
                let transformMatrix = transform.WorldMatrix;
                if (_fudgeNode.getComponentByName("Pivot")) {
                    let pivot = _fudgeNode.getComponentByName("Pivot");
                    transformMatrix = WebEngine.Mat4.multiply(pivot.Matrix, transform.WorldMatrix);
                }
                let objectViewProjectionMatrix = WebEngine.Mat4.multiply(_matrix, transformMatrix);
                // Supply matrixdata to shader. 
                WebEngine.gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.Data);
                // Draw call
                WebEngine.gl2.drawArrays(WebEngine.gl2.TRIANGLES, mesh.BufferSpecification.offset, mesh.VertexCount);
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode = _fudgeNode.getChildren()[name];
                this.drawObjects(childNode, _matrix);
            }
        }
        /**
         * Updates the transforms worldmatrix of a passed node for the drawcall and calls this function recursive for all its children.
         * @param _fudgeNode The node which's transform worldmatrix to update.
         */
        updateNodeWorldMatrix(_fudgeNode) {
            let transform = _fudgeNode.getComponentByName("Transform");
            if (!_fudgeNode.Parent) {
                transform.WorldMatrix = transform.Matrix;
            }
            else {
                let parentTransform = _fudgeNode.Parent.getComponentByName("Transform");
                transform.WorldMatrix = WebEngine.Mat4.multiply(parentTransform.WorldMatrix, transform.Matrix);
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode = _fudgeNode.getChildren()[name];
                this.updateNodeWorldMatrix(childNode);
            }
        }
        /**
         * Returns the scenegraph's rootnode for computation of worldmatrices.
         */
        viewportNodeSceneGraphRoot() {
            let sceneGraphRoot = this.rootNode;
            while (sceneGraphRoot.Parent) {
                sceneGraphRoot = sceneGraphRoot.Parent;
            }
            return sceneGraphRoot;
        }
        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _fudgeNode The node to initialize.
         */
        initializeViewportNodes(_fudgeNode) {
            if (!_fudgeNode.getComponentByName("Transform")) {
                let transform = new WebEngine.TransformComponent();
                _fudgeNode.addComponent(transform);
            }
            let mesh;
            if (_fudgeNode.getComponentByName("Mesh") == undefined) {
                console.log(`No Mesh attached to node named '${_fudgeNode.Name}'.`);
            }
            else {
                this.initializeNodeBuffer(_fudgeNode);
                mesh = _fudgeNode.getComponentByName("Mesh");
                WebEngine.gl2.bufferData(WebEngine.gl2.ARRAY_BUFFER, new Float32Array(mesh.Positions), WebEngine.gl2.STATIC_DRAW);
                let materialComponent;
                if (_fudgeNode.getComponentByName("Material") == undefined) {
                    console.log(`No Material attached to node named '${_fudgeNode.Name}'.`);
                    console.log("Adding standardmaterial...");
                    _fudgeNode.addComponent(new WebEngine.MaterialComponent(WebEngine.AssetManager.getMaterial("standardMaterial")));
                }
                materialComponent = _fudgeNode.getComponentByName("Material");
                let positionAttributeLocation = materialComponent.Material.PositionAttributeLocation;
                WebEngine.GLUtil.attributePointer(positionAttributeLocation, mesh.BufferSpecification);
                this.initializeNodeMaterial(materialComponent, mesh);
                if (materialComponent.Material.TextureEnabled) {
                    this.initializeNodeTexture(materialComponent, mesh);
                }
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode = _fudgeNode.getChildren()[name];
                this.initializeViewportNodes(childNode);
            }
        }
        /**
         * Initializes the vertexbuffer for a passed node.
         * @param _fudgeNode The node to initialize a buffer for.
         */
        initializeNodeBuffer(_fudgeNode) {
            let buffer = WebEngine.gl2.createBuffer();
            this.buffers[_fudgeNode.Name] = buffer;
            let vertexArrayObject = WebEngine.gl2.createVertexArray();
            this.vertexArrayObjects[_fudgeNode.Name] = vertexArrayObject;
            WebEngine.gl2.bindVertexArray(vertexArrayObject);
            WebEngine.gl2.bindBuffer(WebEngine.gl2.ARRAY_BUFFER, buffer);
        }
        /**
         * Initializes the colorbuffer for a node depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        initializeNodeMaterial(_materialComponent, _meshComponent) {
            let colorBuffer = WebEngine.gl2.createBuffer();
            WebEngine.gl2.bindBuffer(WebEngine.gl2.ARRAY_BUFFER, colorBuffer);
            _meshComponent.applyColor(_materialComponent);
            let colorAttributeLocation = _materialComponent.Material.ColorAttributeLocation;
            WebEngine.gl2.enableVertexAttribArray(colorAttributeLocation);
            WebEngine.GLUtil.attributePointer(colorAttributeLocation, _materialComponent.Material.ColorBufferSpecification);
        }
        /**
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        initializeNodeTexture(_materialComponent, _meshComponent) {
            let textureCoordinateAttributeLocation = _materialComponent.Material.TextureCoordinateLocation;
            let textureCoordinateBuffer = WebEngine.gl2.createBuffer();
            WebEngine.gl2.bindBuffer(WebEngine.gl2.ARRAY_BUFFER, textureCoordinateBuffer);
            _meshComponent.setTextureCoordinates();
            WebEngine.gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
            WebEngine.GLUtil.attributePointer(textureCoordinateAttributeLocation, _materialComponent.Material.TextureBufferSpecification);
            WebEngine.GLUtil.createTexture(_materialComponent.Material.TextureSource);
        }
        /**
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph() {
            let output = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.rootNode.Name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.rootNode));
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
        updateCanvasDisplaySizeAndCamera(canvas, multiplier) {
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
            WebEngine.gl2.viewport(0, 0, width, height);
        }
    } // End class.
    WebEngine.Viewport = Viewport;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=Viewport.js.map