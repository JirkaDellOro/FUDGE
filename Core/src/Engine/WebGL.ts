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
        doneTranformToWorld: boolean;
    }
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
        private nodes: Map<Node, NodeReferences> = new Map();

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

            let shader: Shader = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material.Shader;
            this.createReference<Shader, WebGLProgram>(this.programs, shader, this.createProgram);

            let material: Material = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material;
            this.createReference<Material, WebGLVertexArrayObject>(this.parameters, material, this.createParameter);

            let mesh: Mesh = (<ComponentMesh>(_node.getComponents(ComponentMesh)[0])).getMesh();
            this.createReference<Mesh, WebGLBuffer>(this.buffers, mesh, this.createBuffer);

            let nodeReferences: NodeReferences = { shader: shader, material: material, mesh: mesh, doneTranformToWorld: false };
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

            let shader: Shader = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material.Shader;
            if (shader !== nodeReferences.shader) {
                this.removeReference<Shader, WebGLProgram>(this.programs, nodeReferences.shader, this.deleteProgram);
                this.createReference<Shader, WebGLProgram>(this.programs, shader, this.createProgram);
                nodeReferences.shader = shader;
            }

            let material: Material = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material;
            if (material !== nodeReferences.material) {
                this.removeReference<Material, WebGLVertexArrayObject>(this.parameters, nodeReferences.material, this.deleteParameter);
                this.createReference<Material, WebGLVertexArrayObject>(this.parameters, material, this.createParameter);
                nodeReferences.material = material;
            }

            let mesh: Mesh = (<ComponentMesh>(_node.getComponents(ComponentMesh)[0])).getMesh();
            if (mesh !== nodeReferences.mesh) {
                this.removeReference<Mesh, WebGLBuffer>(this.buffers, nodeReferences.mesh, this.deleteBuffer);
                this.createReference<Mesh, WebGLBuffer>(this.buffers, mesh, this.createBuffer);
                nodeReferences.mesh = mesh;
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
    }
}