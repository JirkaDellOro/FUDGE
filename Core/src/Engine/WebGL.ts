namespace Fudge {
    export interface BufferSpecification {
        size: number;   // The size of the datasample.
        dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
        normalize: boolean; // Flag to normalize the data.
        stride: number; // Number of indices that will be skipped each iteration.
        offset: number; // Index of the element to begin with.
    }
    /*
    interface MapNodeToRenderData {
        [key: Node]: RenderData
    }
    */
    interface NodeReferences {
        shader: Shader;
        material: Material;
        mesh: Mesh;
        doneTransformToWorld: boolean;
    }
    type MapNodeToNodeReferences = Map<Node, NodeReferences>;

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
    export class WebGL {
        // private canvas: HTMLCanvasElement; //offscreen render buffer
        // private crc3: WebGL2RenderingContext;
        private programs: Map<Shader, Reference<WebGLProgram>> = new Map();
        private parameters: Map<Material, Reference<WebGLVertexArrayObject>> = new Map();
        private buffers: Map<Mesh, Reference<WebGLBuffer>> = new Map();
        private nodes: MapNodeToNodeReferences = new Map();

        public addNode(_node: Node): void {
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

        public removeNode(_node: Node): void {
            let nodeReferences: NodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;

            this.removeReference<Shader, WebGLProgram>(this.programs, nodeReferences.shader, this.deleteProgram);
            this.removeReference<Material, WebGLVertexArrayObject>(this.parameters, nodeReferences.material, this.deleteParameter);
            this.removeReference<Mesh, WebGLBuffer>(this.buffers, nodeReferences.mesh, this.deleteBuffer);

            this.nodes.delete(_node);
        }

        public updateNode(_node: Node): void {
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

        public recalculateAllNodeTransforms(): void {
            function markNodeToBeTransformed(_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences): void {
                _nodeReferences.doneTransformToWorld = false;
            }

            let recalculateBranchContainingNode: (_r: NodeReferences, _n: Node, _m: MapNodeToNodeReferences) => void = (_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences) => {
                if (_nodeReferences.doneTransformToWorld)
                    return;
                _nodeReferences.doneTransformToWorld = true;

                // find uppermost untransformed ancestor
                let ancestor: Node = _node;
                let parent: Node;
                while (true) {
                    parent = ancestor.getParent()
                    if (!parent)
                        break;
                    if (_map.get(parent).doneTransformToWorld)
                        break;
                    ancestor = parent;
                }

                let matrix: Matrix4x4 = Matrix4x4.identity;
                if (parent && parent.cmpTransform)
                    matrix = parent.cmpTransform.worldMatrix;

                this.recalculateTransformsOfNodeAndChildren(ancestor, matrix);
            };

            this.nodes.forEach(markNodeToBeTransformed);
            this.nodes.forEach(recalculateBranchContainingNode);
        }


        public drawBranch(_node: Node, _cameraMatrix: Matrix4x4, _matrix: Matrix4x4): void {
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

            let objectViewProjectionMatrix: Matrix4x4 = Matrix4x4.multiply(_cameraMatrix, transformMatrix);
            // Supply matrixdata to shader. 
            //gl2.uniformMatrix4fv(materialComponent.Material.MatrixUniformLocation, false, objectViewProjectionMatrix.data);
            // Draw call
            //gl2.drawArrays(gl2.TRIANGLES, mesh.getBufferSpecification().offset, mesh.getVertexCount());

            for (let name in _node.getChildren()) {
                let childNode: Node = _node.getChildren()[name];
                this.drawBranch(childNode, _cameraMatrix, transformMatrix);
            }
        }


        private recalculateTransformsOfNodeAndChildren(_node: Node, _matrix: Matrix4x4 = Matrix4x4.identity): void {
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

        private removeReference<KeyType, ReferenceType>(_in: Map<KeyType, Reference<ReferenceType>>, _key: KeyType, _deletor: Function): void {
            let reference: Reference<ReferenceType>;
            reference = _in.get(_key);
            if (reference.decreaseCounter() == 0) {
                // The following deletions may be an optimization, not necessary to start with and maybe counterproductive.
                // If data should be used later again, it must then be reconstructed...
                _deletor(reference);
                _in.delete(_key);
            }
        }

        private createReference<KeyType, ReferenceType>(_in: Map<KeyType, Reference<ReferenceType>>, _key: KeyType, _creator: Function): void {
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

        private createProgram(_shader: Shader): WebGLProgram {
            return new WebGLProgram();
        }
        private createParameter(_material: Material): WebGLVertexArrayObject {
            return new WebGLVertexArrayObject();
        }
        private createBuffer(_mesh: Mesh): WebGLBuffer {
            return new WebGLBuffer();
        }
        private deleteProgram(_program: WebGLProgram): void {
            // to be implemented;
        }
        private deleteParameter(_parameter: WebGLVertexArrayObject): void {
            // to be implemented;
        }
        private deleteBuffer(_buffer: WebGLBuffer): void {
            // to be implemented;
        }
        private useProgram(_program: WebGLProgram): void {
            // to be implemented;
        }
        private useParameter(_parameter: WebGLVertexArrayObject): void {
            // to be implemented;
        }
        private useBuffer(_buffer: WebGLBuffer): void {
            // to be implemented;
        }
    }
}