namespace Fudge {
    /**
     * Abstract base class for all meshes. 
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     * 
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Mesh implements Serializable {
        // TODO: check if these arrays must be cached like this or if calling the methods is better.
        public vertices: Float32Array;
        public indices: Uint16Array;
        public textureUVs: Float32Array;

        public static getBufferSpecification(): BufferSpecification {
            return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
        }
        public getVertexCount(): number {
            return this.vertices.length / Mesh.getBufferSpecification().size;
        }
        public getIndexCount(): number {
            return this.indices.length;
        }

        public abstract serialize(): Serialization;
        public abstract deserialize(_serialization: Serialization): Serializable;

        public abstract create(): void;
        protected abstract createVertices(): Float32Array;
        protected abstract createTextureUVs(): Float32Array;
        protected abstract createIndices(): Uint16Array;

    }
}