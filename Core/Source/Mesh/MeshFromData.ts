namespace FudgeCore {

    /** Allows to create custom meshes from given Data */
    export class MeshFromData extends Mesh {
            protected verticesToSet: Float32Array;
            protected textureUVsToSet: Float32Array;
            protected indicesToSet: Uint16Array;
            protected faceNormalsToSet: Float32Array;
        
        public constructor(_vertices: Float32Array, _textureUVs: Float32Array, _indices: Uint16Array, _faceNormals: Float32Array) {
            super();
            this.verticesToSet = _vertices;
            this.textureUVsToSet = _textureUVs;
            this.indicesToSet = _indices;
            this.faceNormalsToSet = _faceNormals;
        }

        protected createVertices(): Float32Array {
            return this.verticesToSet;
        }

        protected createTextureUVs(): Float32Array {
            return this.textureUVsToSet;
        }

        protected createIndices(): Uint16Array {
            return this.indicesToSet;
        }

        protected createFlatNormals(): Float32Array {
            return this.faceNormalsToSet;
        }
    }
}
