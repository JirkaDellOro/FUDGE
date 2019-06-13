namespace Fudge {
    /**
     * Generate a simple cube with edges of length 1, each face consisting of two trigons
     *
     *            4____7
     *           0/__3/|
     *            ||5_||6
     *           1|/_2|/             
     * 
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class MeshCube extends Mesh {
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
                // front
                /*0*/ -1, -1, -1, /*1*/ -1, 1, -1,  /*2*/ 1, 1, -1, /*3*/ 1, -1, -1,
                // back
                /*4*/ -1, -1, 1, /* 5*/ -1, 1, 1,  /* 6*/ 1, 1, 1, /* 7*/ 1, -1, 1
            ]);

            // scale down to a length of 1 for all edges
            for (let iVertex: number = 0; iVertex < vertices.length; iVertex++) {
                vertices[iVertex] *= 1 / 2;
            }
            return vertices;
        }

        protected createIndices(): Uint16Array {
            let indices: Uint16Array = new Uint16Array([
                // front
                0, 1, 2, 0, 2, 3,
                // right
                3, 2, 6, 3, 6, 7,
                // back
                7, 6, 5, 7, 5, 4,
                // left
                4, 5, 1, 4, 1, 0,
                // top
                4, 0, 3, 4, 3, 7,
                // bottom
                1, 5, 6, 1, 6, 2
            ]);
            return indices;
        }

        protected createTextureUVs(): Float32Array {
            let textureUVs: Float32Array = new Float32Array([
                // front
                /*0*/ 0, 0, /*1*/ 0, 1,  /*2*/ 1, 1, /*3*/ 1, 0,
                // back
                /*4*/ 3, 0, /*5*/ 3, 1,  /*6*/ 2, 1, /*7*/ 2, 0
            ]);
            return textureUVs;
        }
    }
}