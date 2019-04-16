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
    interface RenderData {
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
        private canvas: HTMLCanvasElement; //offscreen render buffer
        private crc3: WebGL2RenderingContext;
        private programs: Map<Shader, Reference<WebGLProgram>> = new Map();
        private parameters: Map<Material, Reference<WebGLVertexArrayObject>> = new Map();
        private buffers: Map<Mesh, Reference<WebGLBuffer>> = new Map();
        private nodes: Map<Node, RenderData> = new Map();

        public addNode(_node: Node): void {
            if (this.nodes.get(_node))
                return;

            let shader: Shader = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material.Shader;
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

            let material: Material = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material;
            let rfrParameter: Reference<WebGLVertexArrayObject>;
            rfrProgram = this.parameters.get(material);
            if (rfrParameter)
                rfrParameter.increaseCounter();
            else {
                let parameter: WebGLVertexArrayObject = this.createParameter(material);
                rfrParameter = new Reference<WebGLVertexArrayObject>(parameter);
                rfrParameter.increaseCounter();
                this.parameters.set(material, rfrParameter);
            }
        }

        //function createReference(_in: Map, )

        private createProgram(_shader: Shader): WebGLProgram {
            return new WebGLProgram();
        }
        private createParameter(_material: Material): WebGLVertexArrayObject {
            return new WebGLVertexArrayObject();
        }
        private createBuffer(_mesh: Mesh): WebGLBuffer {
            return new WebGLBuffer();
        }
    }
}