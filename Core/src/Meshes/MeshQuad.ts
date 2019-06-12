namespace Fudge {
    /**
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class MeshQuad extends Mesh {
        /*               
             0 __ 3
              |__|
             1    2             
        */
        public constructor() {
            super();
            this.create();
        }

        public create(): void {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
        }

        public serialize(): Serialization {
            let serialization: Serialization = {};
            serialization[this.constructor.name] = this;
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.create(); // TODO: must not be created, if an identical mesh already exists
            return this;
        }

        protected createVertices(): Float32Array {
            let vertices: Float32Array = new Float32Array([
                /*0*/ -1, -1, 0, /*1*/ -1, 1, 0,  /*2*/ 1, 1, 0, /*3*/ 1, -1, 0
            ]);

            for (let iVertex: number = 0; iVertex < vertices.length; iVertex++) {
                vertices[iVertex] *= 1 / 2;
            }
            return vertices;
        }
        protected createIndices(): Uint16Array {
            let indices: Uint16Array = new Uint16Array([
                0, 1, 2, 0, 2, 3
            ]);
            return indices;
        }

        protected createTextureUVs(): Float32Array {
            // TODO: calculate using trigonometry
            let textureUVs: Float32Array = new Float32Array([
                // front
                /*0*/ 0, 0, /*1*/ 0, 1,  /*2*/ 1, 1, /*3*/ 1, 0
            ]);
            return textureUVs;
        }

    }
}