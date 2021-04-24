namespace FudgeCore {

    /** Allows to create custom meshes from given Data */
    export class MeshFromData extends Mesh {

        public constructor(
            protected _vertices: Float32Array,
            protected _textureUVs: Float32Array,
            protected _indices: Float32Array,
            protected _faceNormals: Float32Array
        ) { super(); }

        protected createVertices(): Float32Array {
            return this._vertices;
        }

        protected createTextureUVs(): Float32Array {
            return this._textureUVs;
        }

        protected createIndices(): Uint16Array {
            return new Uint16Array(this._indices);
        }

        protected createFaceNormals(): Float32Array {
            return new Float32Array(this._faceNormals);
        }
    }
}