namespace FudgeCore {
    /**
     * Provides an empty Mesh Object
     */
    export class MeshPoly extends Mesh {
        public constructor() {
            super();
        }

        //Useless but required by parent class
        public create(): void{}
        protected createVertices(): Float32Array {return null;}
        protected createIndices(): Uint16Array {return null;}
        protected createTextureUVs(): Float32Array {return null;}
        protected createFaceNormals(): Float32Array {return null;}
    }
}