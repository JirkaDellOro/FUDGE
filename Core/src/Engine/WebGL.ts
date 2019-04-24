namespace Fudge {
    export interface BufferSpecification {
        size: number;   // The size of the datasample.
        dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
        normalize: boolean; // Flag to normalize the data.
        stride: number; // Number of indices that will be skipped each iteration.
        offset: number; // Index of the element to begin with.
    }
    /**
     * To each node registered with WebGL, a reference to the shader, the material and the mesh used is stored separately
     * With these references, the already buffered data is retrieved.
     */
    interface NodeReferences {
        shader: Shader;
        material: Material;
        mesh: Mesh;
        doneTransformToWorld: boolean;
    }
    type MapNodeToNodeReferences = Map<Node, NodeReferences>;

    /**
     * This class manages the references to the programs, buffers and vertex array objects created and stored with WebGL.
     * Multiple nodes may refer to the same data via their references to shader, material and mesh 
     */
    class WebGLReference<T> {
        private reference: T;
        private count: number = 0;

        constructor(_reference: T) {
            this.reference = _reference;
        }

        public getReference(): T {
            return this.reference;
        }

        public increaseCounter(): number {
            this.count++;
            return this.count;
        }
        public decreaseCounter(): number {
            if (this.count == 0) throw (new Error("Negative reference counter"));
            this.count--;
            return this.count;
        }
    }

    /**
     * This class manages the connection of FUDGE to WebGL and the association of [[Nodes]] with the appropriate WebGL data.
     * Nodes to render (refering shaders, meshes and material) must be registered, which creates and associates the necessary references to WebGL buffers and programs.
     * Renders branches of scenetrees to an offscreen buffer, the viewports will copy from there.
     */
    export class WebGL extends EventTarget {
        // private canvas: HTMLCanvasElement; //offscreen render buffer
        // private crc3: WebGL2RenderingContext;
        /** Stores references to the compiled shader programs and makes them available via the references to shaders */
        private static programs: Map<Shader, WebGLReference<WebGLProgram>> = new Map();
        /** Stores references to the vertex array objects and makes them available via the references to materials */
        private static parameters: Map<Material, WebGLReference<WebGLVertexArrayObject>> = new Map();
        /** Stores references to the vertex buffers and makes them available via the references to meshes */
        private static buffers: Map<Mesh, WebGLReference<WebGLBuffer>> = new Map();
        private static nodes: MapNodeToNodeReferences = new Map();

        // #region Adding
        /**
         * Register the node for rendering. Create a NodeReference for it and increase the matching WebGL references or create them first if necessary
         * @param _node 
         */
        public static addNode(_node: Node): void {
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

            let shader: Shader = (<ComponentMaterial>(_node.getComponent(ComponentMaterial))).Material.Shader;
            this.createReference<Shader, WebGLProgram>(this.programs, shader, this.createProgram);

            let material: Material = (<ComponentMaterial>(_node.getComponent(ComponentMaterial))).Material;
            this.createReference<Material, WebGLVertexArrayObject>(this.parameters, material, this.createParameter);

            let mesh: Mesh = (<ComponentMesh>(_node.getComponent(ComponentMesh))).getMesh();
            this.createReference<Mesh, WebGLBuffer>(this.buffers, mesh, this.createBuffer);

            let nodeReferences: NodeReferences = { shader: shader, material: material, mesh: mesh, doneTransformToWorld: false };
            this.nodes.set(_node, nodeReferences);
        }

        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node 
         */
        public static addBranch(_node: Node): void {
            for (let node of _node.branch)
                try {
                    this.addNode(node);
                } catch (_e) {
                    console.log(_e);
                }
        }
        // #endregion

        // #region Removing
        /**
         * Unregister the node so that it won't be rendered any more. Decrease the WebGL references and delete the NodeReferences.
         * @param _node 
         */
        public static removeNode(_node: Node): void {
            let nodeReferences: NodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;

            this.removeReference<Shader, WebGLProgram>(this.programs, nodeReferences.shader, this.deleteProgram);
            this.removeReference<Material, WebGLVertexArrayObject>(this.parameters, nodeReferences.material, this.deleteParameter);
            this.removeReference<Mesh, WebGLBuffer>(this.buffers, nodeReferences.mesh, this.deleteBuffer);

            this.nodes.delete(_node);
        }

        /**
         * Unregister the node and its valid successors in the branch to free WebGL resources. Uses [[removeNode]]
         * @param _node 
         */
        public static removeBranch(_node: Node): void {
            for (let node of _node.branch)
                this.removeNode(node);
        }
        // #endregion

        // #region Updating
        /**
         * Reflect changes in the node concerning shader, material and mesh, manage the WebGL references accordingly and update the NodeReferences
         * @param _node
         */
        public static updateNode(_node: Node): void {
            let nodeReferences: NodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;

            let shader: Shader = (<ComponentMaterial>(_node.getComponent(ComponentMaterial))).Material.Shader;
            if (shader !== nodeReferences.shader) {
                this.removeReference<Shader, WebGLProgram>(this.programs, nodeReferences.shader, this.deleteProgram);
                this.createReference<Shader, WebGLProgram>(this.programs, shader, this.createProgram);
                nodeReferences.shader = shader;
            }

            let material: Material = (<ComponentMaterial>(_node.getComponent(ComponentMaterial))).Material;
            if (material !== nodeReferences.material) {
                this.removeReference<Material, WebGLVertexArrayObject>(this.parameters, nodeReferences.material, this.deleteParameter);
                this.createReference<Material, WebGLVertexArrayObject>(this.parameters, material, this.createParameter);
                nodeReferences.material = material;
            }

            let mesh: Mesh = (<ComponentMesh>(_node.getComponent(ComponentMesh))).getMesh();
            if (mesh !== nodeReferences.mesh) {
                this.removeReference<Mesh, WebGLBuffer>(this.buffers, nodeReferences.mesh, this.deleteBuffer);
                this.createReference<Mesh, WebGLBuffer>(this.buffers, mesh, this.createBuffer);
                nodeReferences.mesh = mesh;
            }
        }

        /**
         * Update the node and its valid successors in the branch using [[updateNode]]
         * @param _node 
         */
        public static updateBranch(_node: Node): void {
            for (let node of _node.branch)
                this.updateNode(node);
        }
        // #endregion

        // #region Transformation & Rendering
        /**
         * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
         */
        public static recalculateAllNodeTransforms(): void {
            // inner function to be called in a for each node at the bottom of this function
            function markNodeToBeTransformed(_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences): void {
                _nodeReferences.doneTransformToWorld = false;
            }

            // inner function to be called in a for each node at the bottom of this function
            let recalculateBranchContainingNode: (_r: NodeReferences, _n: Node, _m: MapNodeToNodeReferences) => void = (_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences) => {
                if (_nodeReferences.doneTransformToWorld)
                    return;
                _nodeReferences.doneTransformToWorld = true;

                // find uppermost ancestor not recalculated yet
                let ancestor: Node = _node;
                let parent: Node;
                while (true) {
                    parent = ancestor.getParent();
                    if (!parent)
                        break;
                    let parentReferences: NodeReferences = _map.get(parent);
                    if (parentReferences && parentReferences.doneTransformToWorld)
                        break;
                    ancestor = parent;
                }

                // use the ancestors parent world matrix to start with, or identity if no parent exists or it's missing a ComponenTransform
                let matrix: Matrix4x4 = Matrix4x4.identity;
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
        public static drawBranch(_node: Node, _cameraMatrix: Matrix4x4, _matrix?: Matrix4x4): void {
            let references: NodeReferences = this.nodes.get(_node);
            this.useProgram(this.programs.get(references.shader));
            this.useParameter(this.parameters.get(references.material));
            this.useBuffer(this.programs.get(references.shader));

            let cmpTransform: ComponentTransform = _node.cmpTransform;
            let transformMatrix: Matrix4x4 = _matrix;
            if (cmpTransform)
                transformMatrix = cmpTransform.worldMatrix;
            if (!transformMatrix)
                transformMatrix = Matrix4x4.identity;

            let pivot: ComponentPivot = <ComponentPivot>_node.getComponent(ComponentPivot);
            if (pivot)
                transformMatrix = Matrix4x4.multiply(pivot.Matrix, transformMatrix);

            // multiply camera matrix
            // let objectViewProjectionMatrix: Matrix4x4 = Matrix4x4.multiply(_cameraMatrix, transformMatrix);
            // Supply matrixdata to shader. 
            //gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.data);
            // Draw call
            //gl2.drawArrays(gl2.TRIANGLES, mesh.getBufferSpecification().offset, mesh.getVertexCount());

            for (let name in _node.getChildren()) {
                let childNode: Node = _node.getChildren()[name];
                this.drawBranch(childNode, _cameraMatrix, transformMatrix);
            }
        }

        /**
         * Recursive method receiving a childnode and its parents updated world transform.  
         * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
         * @param _node 
         * @param _matrix 
         */
        private static recalculateTransformsOfNodeAndChildren(_node: Node, _matrix: Matrix4x4 = Matrix4x4.identity): void {
            let worldMatrix: Matrix4x4 = _matrix;
            let transform: ComponentTransform = _node.cmpTransform;
            if (transform) {
                worldMatrix = Matrix4x4.multiply(_matrix, transform.Matrix);
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
        private static removeReference<KeyType, ReferenceType>(_in: Map<KeyType, WebGLReference<ReferenceType>>, _key: KeyType, _deletor: Function): void {
            let reference: WebGLReference<ReferenceType>;
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
        private static createReference<KeyType, ReferenceType>(_in: Map<KeyType, WebGLReference<ReferenceType>>, _key: KeyType, _creator: Function): void {
            let reference: WebGLReference<ReferenceType>;
            reference = _in.get(_key);
            if (reference)
                reference.increaseCounter();
            else {
                let content: ReferenceType = _creator(_key);
                reference = new WebGLReference<ReferenceType>(content);
                reference.increaseCounter();
                _in.set(_key, reference);
            }
        }
        // #endregion

        // #region Dummy-Methods
        private static createProgram(_shader: Shader): WebGLProgram {
            // return new WebGLProgram();
            return <WebGLProgram>"Program";
        }
        private static createParameter(_material: Material): WebGLVertexArrayObject {
            // return new WebGLVertexArrayObject();
            return <WebGLVertexArrayObject>"VAO";
        }
        private static createBuffer(_mesh: Mesh): WebGLBuffer {
            // return new WebGLBuffer();
            return <WebGLBuffer>"Buffer";
        }
        private static deleteProgram(_program: WebGLProgram): void {
            // to be implemented;
        }
        private static deleteParameter(_parameter: WebGLVertexArrayObject): void {
            // to be implemented;
        }
        private static deleteBuffer(_buffer: WebGLBuffer): void {
            // to be implemented;
        }
        private static useProgram(_program: WebGLProgram): void {
            // to be implemented;
        }
        private static useParameter(_parameter: WebGLVertexArrayObject): void {
            // to be implemented;
        }
        private static useBuffer(_buffer: WebGLBuffer): void {
            // to be implemented;
        }
        // #endregion
    }
}