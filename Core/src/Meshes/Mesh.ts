namespace Fudge {
    export abstract class Mesh implements Serializable {
        protected vertices: Float32Array;

        public getVertices(): Float32Array {
            return this.vertices;
        };

        public getVertexCount(): number {
            return this.vertices.length / this.getBufferSpecification().size;
        }

        public getBufferSpecification(): BufferSpecification {
            return {
                size: 3,
                dataType: WebGL2RenderingContext.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            };
        }

        public abstract serialize(): Serialization;
        public abstract deserialize(_serialization: Serialization): Serializable;
    }
}