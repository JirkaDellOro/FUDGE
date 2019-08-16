namespace FudgeCore {
    /**
     * Abstract base class for all meshes. 
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     * 
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Mesh implements SerializableResource {
        // TODO: check if these arrays must be cached like this or if calling the methods is better.
        public vertices: Float32Array;
        public indices: Uint16Array;
        public textureUVs: Float32Array;
        public normalsFace: Float32Array;

        public idResource: string = undefined;

        public static getBufferSpecification(): BufferSpecification {
            return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
        }
        public getVertexCount(): number {
            return this.vertices.length / Mesh.getBufferSpecification().size;
        }
        public getIndexCount(): number {
            return this.indices.length;
        }

        // Serialize/Deserialize for all meshes that calculate without parameters
        public serialize(): Serialization {
            let serialization: Serialization = {
                idResource: this.idResource
            }; // no data needed ...
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.create(); // TODO: must not be created, if an identical mesh already exists
            this.idResource = _serialization.idResource;
            return this;
        }

        public abstract create(): void;
        protected abstract createVertices(): Float32Array;
        protected abstract createTextureUVs(): Float32Array;
        protected abstract createIndices(): Uint16Array;
        protected abstract createFaceNormals(): Float32Array;
    }
}