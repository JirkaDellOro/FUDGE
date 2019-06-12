namespace Fudge {
    export abstract class Mesh implements Serializable {
        protected vertices: Float32Array;
        protected indices: Uint16Array;
        protected textureUVs: Float32Array;

        public static getBufferSpecification(): BufferSpecification {
            return {
                size: 3,
                dataType: WebGL2RenderingContext.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            };
        }

        public getVertices(): Float32Array {
            return this.vertices;
        }

        public getTextureUVs(): Float32Array {
            return this.textureUVs;
        }

        public getVertexCount(): number {
            return this.vertices.length / Mesh.getBufferSpecification().size;
        }


        public abstract serialize(): Serialization;
        public abstract deserialize(_serialization: Serialization): Serializable;
    }
}