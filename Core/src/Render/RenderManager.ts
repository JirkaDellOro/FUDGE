/// <reference path="RenderOperator.ts"/>
namespace Fudge {
    interface NodeReferences {
        shader: typeof Shader;
        coat: Coat;
        mesh: Mesh;
        doneTransformToWorld: boolean;
    }
    type MapNodeToNodeReferences = Map<Node, NodeReferences>;

    /**
     * This class manages the references to render data used by nodes.
     * Multiple nodes may refer to the same data via their references to shader, coat and mesh 
     */
    class Reference<T> {
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
     * Manages the handling of the ressources that are going to be rendered by [[RenderOperator]].
     * Stores the references to the shader, the coat and the mesh used for each node registered. 
     * With these references, the already buffered data is retrieved when rendering.
     */
    export class RenderManager extends RenderOperator {
        /** Stores references to the compiled shader programs and makes them available via the references to shaders */
        private static renderShaders: Map<typeof Shader, Reference<RenderShader>> = new Map();
        /** Stores references to the vertex array objects and makes them available via the references to coats */
        private static renderCoats: Map<Coat, Reference<RenderCoat>> = new Map();
        /** Stores references to the vertex buffers and makes them available via the references to meshes */
        private static renderBuffers: Map<Mesh, Reference<RenderBuffers>> = new Map();
        private static nodes: MapNodeToNodeReferences = new Map();

        // #region Adding
        /**
         * Register the node for rendering. Create a reference for it and increase the matching render-data references or create them first if necessary
         * @param _node 
         */
        public static addNode(_node: Node): void {
            if (this.nodes.get(_node))
                return;

            let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
            if (!cmpMaterial)
                return;

            let shader: typeof Shader = cmpMaterial.getMaterial().getShader();
            this.createReference<typeof Shader, RenderShader>(this.renderShaders, shader, this.createProgram);

            let coat: Coat = cmpMaterial.getMaterial().getCoat();
            this.createReference<Coat, RenderCoat>(this.renderCoats, coat, this.createParameter);

            let mesh: Mesh = (<ComponentMesh>(_node.getComponent(ComponentMesh))).getMesh();
            this.createReference<Mesh, RenderBuffers>(this.renderBuffers, mesh, this.createBuffers);

            let nodeReferences: NodeReferences = { shader: shader, coat: coat, mesh: mesh, doneTransformToWorld: false };
            this.nodes.set(_node, nodeReferences);
        }

        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node 
         */
        public static addBranch(_node: Node): void {
            for (let node of _node.branch)
                try {
                    // may fail when some components are missing. TODO: cleanup
                    this.addNode(node);
                } catch (_e) {
                    console.log(_e);
                }
        }
        // #endregion

        // #region Removing
        /**
         * Unregister the node so that it won't be rendered any more. Decrease the render-data references and delete the node reference.
         * @param _node 
         */
        public static removeNode(_node: Node): void {
            let nodeReferences: NodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;

            this.removeReference<typeof Shader, RenderShader>(this.renderShaders, nodeReferences.shader, this.deleteProgram);
            this.removeReference<Coat, RenderCoat>(this.renderCoats, nodeReferences.coat, this.deleteParameter);
            this.removeReference<Mesh, RenderBuffers>(this.renderBuffers, nodeReferences.mesh, this.deleteBuffers);

            this.nodes.delete(_node);
        }

        /**
         * Unregister the node and its valid successors in the branch to free renderer resources. Uses [[removeNode]]
         * @param _node 
         */
        public static removeBranch(_node: Node): void {
            for (let node of _node.branch)
                this.removeNode(node);
        }
        // #endregion

        // #region Updating
        /**
         * Reflect changes in the node concerning shader, coat and mesh, manage the render-data references accordingly and update the node references
         * @param _node
         */
        public static updateNode(_node: Node): void {
            let nodeReferences: NodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;

            let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);

            let shader: typeof Shader = cmpMaterial.getMaterial().getShader();
            if (shader !== nodeReferences.shader) {
                this.removeReference<typeof Shader, RenderShader>(this.renderShaders, nodeReferences.shader, this.deleteProgram);
                this.createReference<typeof Shader, RenderShader>(this.renderShaders, shader, this.createProgram);
                nodeReferences.shader = shader;
            }

            let coat: Coat = cmpMaterial.getMaterial().getCoat();
            if (coat !== nodeReferences.coat) {
                this.removeReference<Coat, RenderCoat>(this.renderCoats, nodeReferences.coat, this.deleteParameter);
                this.createReference<Coat, RenderCoat>(this.renderCoats, coat, this.createParameter);
                nodeReferences.coat = coat;
            }

            let mesh: Mesh = (<ComponentMesh>(_node.getComponent(ComponentMesh))).getMesh();
            if (mesh !== nodeReferences.mesh) {
                this.removeReference<Mesh, RenderBuffers>(this.renderBuffers, nodeReferences.mesh, this.deleteBuffers);
                this.createReference<Mesh, RenderBuffers>(this.renderBuffers, mesh, this.createBuffers);
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
                    matrix = parent.cmpTransform.world;

                // start recursive recalculation of the whole branch starting from the ancestor found
                this.recalculateTransformsOfNodeAndChildren(ancestor, matrix);
            };

            // call the functions above for each registered node
            this.nodes.forEach(markNodeToBeTransformed);
            this.nodes.forEach(recalculateBranchContainingNode);
        }

        public static clear(_color: Color = null): void {
            this.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
            this.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
        }
        /**
         * Draws the branch starting with the given [[Node]] using the projection matrix given as _cameraMatrix.
         * If the node lacks a [[ComponentTransform]], respectively a worldMatrix, the matrix given as _matrix will be used to transform the node
         * or the identity matrix, if _matrix is null.
         * @param _node 
         * @param _cameraMatrix 
         * @param _world 
         */
        public static drawBranch(_node: Node, _cmpCamera: ComponentCamera, _world?: Matrix4x4): void {
            let cmpTransform: ComponentTransform = _node.cmpTransform;
            let world: Matrix4x4 = _world;
            if (cmpTransform)
                world = cmpTransform.world;
            if (!world)
                // neither ComponentTransform found nor world-transformation passed from parent -> use identity
                world = Matrix4x4.identity;

            let finalTransform: Matrix4x4 = world;
            let cmpPivot: ComponentPivot = <ComponentPivot>_node.getComponent(ComponentPivot);
            if (cmpPivot)
                finalTransform = Matrix4x4.multiply(world, cmpPivot.local);

            // multiply camera matrix
            let projection: Matrix4x4 = Matrix4x4.multiply(_cmpCamera.ViewProjectionMatrix, finalTransform);

            this.drawNode(_node, projection);

            for (let name in _node.getChildren()) {
                let childNode: Node = _node.getChildren()[name];
                this.drawBranch(childNode, _cmpCamera, world);
            }
        }

        // TODO switch back to private
        public static drawNode(_node: Node, _projection: Matrix4x4): void {
            let references: NodeReferences = this.nodes.get(_node);
            if (!references)
                return; // TODO: deal with partial references

            let bufferInfo: RenderBuffers = this.renderBuffers.get(references.mesh).getReference();
            let coatInfo: RenderCoat = this.renderCoats.get(references.coat).getReference();
            let shaderInfo: RenderShader = this.renderShaders.get(references.shader).getReference();
            this.draw(shaderInfo, bufferInfo, coatInfo, _projection);
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
                worldMatrix = Matrix4x4.multiply(_matrix, transform.local);
                transform.world = worldMatrix;
            }
            for (let child of _node.getChildren()) {
                this.recalculateTransformsOfNodeAndChildren(child, worldMatrix);
            }
        }
        // #endregion

        // #region Manage references to render data
        /**
         * Removes a reference to a program, parameter or buffer by decreasing its reference counter and deleting it, if the counter reaches 0
         * @param _in 
         * @param _key 
         * @param _deletor 
         */
        private static removeReference<KeyType, ReferenceType>(_in: Map<KeyType, Reference<ReferenceType>>, _key: KeyType, _deletor: Function): void {
            let reference: Reference<ReferenceType>;
            reference = _in.get(_key);
            if (reference.decreaseCounter() == 0) {
                // The following deletions may be an optimization, not necessary to start with and maybe counterproductive.
                // If data should be used later again, it must then be reconstructed...
                _deletor(reference.getReference());
                _in.delete(_key);
            }
        }

        /**
         * Increases the counter of the reference to a program, parameter or buffer. Creates the reference, if it's not existent.
         * @param _in 
         * @param _key 
         * @param _creator 
         */
        private static createReference<KeyType, ReferenceType>(_in: Map<KeyType, Reference<ReferenceType>>, _key: KeyType, _creator: Function): void {
            let reference: Reference<ReferenceType>;
            reference = _in.get(_key);
            if (reference)
                reference.increaseCounter();
            else {
                let content: ReferenceType = _creator(_key);
                reference = new Reference<ReferenceType>(content);
                reference.increaseCounter();
                _in.set(_key, reference);
            }
        }
    }
}