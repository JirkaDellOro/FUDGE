namespace WebEngine {

    export class Viewport {
        private camera: Camera; // The camera from which's position and view the tree will be rendered.
        private rootNode: FudgeNode; // The first node in the tree(branch) that will be rendered.
        private vertexArrayObjects: { [key: string]: WebGLVertexArrayObject } = {}; // Associative array that holds a vertexarrayobject for each node in the tree(branch)
        private buffers: { [key: string]: WebGLBuffer } = {}; // Associative array that holds a buffer for each node in the tree(branch)
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode 
         * @param _camera 
         */
        public constructor(_rootNode: FudgeNode, _camera: Camera) {
            this.rootNode = _rootNode;
            this.camera = _camera;
            this.initializeViewPortNodes(this.rootNode);
        }
        
        public drawScene(): void {
            if (this.camera.Enabled) {
                this.updateCanvasDisplaySizeAndCamera(gl2.canvas);
                gl2.clearColor(this.camera.BackgroundColor.X, this.camera.BackgroundColor.Y, this.camera.BackgroundColor.Z, this.camera.BackgroundEnabled ? 1 : 0);
                gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);
                // Enable backface- and zBuffer-culling.
                gl2.enable(gl2.CULL_FACE);
                gl2.enable(gl2.DEPTH_TEST);
                let projectionMatrix: Mat4 = this.camera.ProjectionMatrix;
                let cameraTransformMatrix: Mat4 = (<Transform>this.camera.Container.getComponentByName("Transform")).Matrix || Mat4.identity();
                let viewMatrix: Mat4 = Mat4.inverse(cameraTransformMatrix);
                let viewProjectionMatrix: Mat4 = Mat4.multiply(projectionMatrix, viewMatrix);
                this.updateNodeWorldMatrix(this.rootNode);
                this.drawObjects(this.rootNode, viewProjectionMatrix);
            }
        }

        /**
         * Draws the passed node with the passed viewprojectionmatrix and calls this function recursive for all its children.
         * @param _fudgeNode The currend node to be drawn.
         * @param _matrix The viewprojectionmatrix of this viewports camera.
         */
        private drawObjects(_fudgeNode: FudgeNode, _matrix: Mat4): void {
            if (_fudgeNode.getComponentByName("Mesh")) {
                let mesh: Mesh = <Mesh>_fudgeNode.getComponentByName("Mesh");
                let transform = <Transform>_fudgeNode.getComponentByName("Transform");
                let material: Material = <Material>_fudgeNode.getComponentByName("Material");
                let shader: Shader = material.BaseMaterial.Shader;
                let positionAttributeLocation = material.BaseMaterial.PositionAttributeLocation;
                let matrixLocation = material.BaseMaterial.MatrixUniformLocation;
                shader.use();
                gl2.bindVertexArray(this.vertexArrayObjects[_fudgeNode.Name]);
                gl2.enableVertexAttribArray(positionAttributeLocation);
                // Compute the matrices
                let transformMatrix: Mat4 = transform.WorldMatrix;
                if (_fudgeNode.getComponentByName("Pivot")) {
                    let pivot = <Pivot>_fudgeNode.getComponentByName("Pivot");
                    transformMatrix = Mat4.multiply(pivot.Matrix, transform.WorldMatrix);
                }
                let nodeViewProjectionMatrix: Mat4 = Mat4.multiply(_matrix, transformMatrix);
                // Supply matrixdata to shader. 
                gl2.uniformMatrix4fv(matrixLocation, false, nodeViewProjectionMatrix.Data);
                // Draw call
                gl2.drawArrays(gl2.TRIANGLES, mesh.BufferData.offset, mesh.VertexCount);
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
            let transform: Transform;
            if (!_fudgeNode.getComponentByName("Transform")) {
                transform = new Transform();
                _fudgeNode.addComponent(transform);
            }
            else {
                transform = <Transform>_fudgeNode.getComponentByName("Transform");
            }
            if (!_fudgeNode.Parent) {
                transform.WorldMatrix = transform.Matrix;
            }
            else {
                let parentTransform: Transform = (<Transform>_fudgeNode.Parent.getComponentByName("Transform"));
                transform.WorldMatrix = Mat4.multiply(parentTransform.WorldMatrix, transform.Matrix);
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode: FudgeNode = _fudgeNode.getChildren()[name];
                this.updateNodeWorldMatrix(childNode);

            }
        }
        /**
         * Initializes the vertexbuffer, material and texture for a passed node and calls this function recursive for all its children.
         * @param _fudgeNode The node to initialize.
         */
        public initializeViewPortNodes(_fudgeNode: FudgeNode): void {
            this.initializeNodeBuffer(_fudgeNode);
            let mesh: Mesh;
            if (_fudgeNode.getComponentByName("Mesh") == undefined) {
                console.log(`No Mesh attached to node named '${_fudgeNode.Name}'.`);
            }
            else {
                mesh = <Mesh>_fudgeNode.getComponentByName("Mesh");
                gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(mesh.Positions), gl2.STATIC_DRAW);
                let material: Material;
                if (_fudgeNode.getComponentByName("Material") == undefined) {
                    console.log(`No Material attached to node named '${_fudgeNode.Name}'.`);
                    console.log("Adding standardmaterial...");
                    _fudgeNode.addComponent(new Material(baseMaterial, new Vec3(190, 190, 190)));
                }
                material = <Material>_fudgeNode.getComponentByName("Material");
                let positionAttributeLocation = material.BaseMaterial.PositionAttributeLocation;
                GLUtil.attributePointer(positionAttributeLocation, mesh.BufferData);
                this.initializeNodeMaterial(material, mesh);

                if (material.TextureEnabled) {
                    this.initializeNodeTexture(material, mesh);
                }
            }
            for (let name in _fudgeNode.getChildren()) {
                let childNode: FudgeNode = _fudgeNode.getChildren()[name];
                this.initializeViewPortNodes(childNode);
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
        private initializeNodeMaterial(_material: Material, _mesh: Mesh): void {
            // Setup new buffer for colorinformation and bind it to context for further use.
            let colorBuffer: WebGLBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
            // Supply materialinformation to the buffer.
            _material.applyColor(_mesh.VertexCount);
            // Enable pulling of data out of the buffer.
            let colorAttributeLocation = _material.BaseMaterial.ColorAttributeLocation;
            gl2.enableVertexAttribArray(colorAttributeLocation);
            // Use material's dataspecifications and bind attribute to colorBuffer.
            GLUtil.attributePointer(colorAttributeLocation, _material.ColorBufferData);
        }

        /**
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        private initializeNodeTexture(_material: Material, _mesh: Mesh): void {
            let textureCoordinateAttributeLocation = _material.BaseMaterial.TextureCoordinateLocation;
            let textureCoordinateBuffer = gl2.createBuffer();
            gl2.bindBuffer(gl2.ARRAY_BUFFER, textureCoordinateBuffer);
            _material.setTextureCoordinates(_mesh.VertexCount);
            gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
            GLUtil.attributePointer(textureCoordinateAttributeLocation, _material.TextureBufferData);
            GLUtil.createTexture(_material.TextureSource);
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
