namespace FudgeCore {

    /** Allows to create custom meshes from given Data */
    export class MeshFromData extends Mesh {
            protected vertices: Float32Array;
            protected textureUVs: Float32Array;
            protected indices: Uint16Array;
            protected faceNormals: Float32Array;
        
        public constructor(_vertices: Float32Array, _textureUVs: Float32Array, _indices: Uint16Array, _faceNormals: Float32Array) {
            super();
            this.vertices = _vertices;
            this.textureUVs = _textureUVs;
            this.indices = _indices;
            this.faceNormals = _faceNormals
        }

        protected createVertices(): Float32Array {
            return this.vertices;
        }

        protected createTextureUVs(): Float32Array {
            return this.textureUVs;
        }

        protected createIndices(): Uint16Array {
            return this.indices;
        }

        protected createFaceNormals(): Float32Array {
            return this.faceNormals;
        }
    }
}
