namespace Fudge {
    /**
     * Generate a simple pyramid with edges at the base of length 1 and a height of 1. The sides consisting of one, the base of two trigons
     * ```text
     *               4
     *              /\`.
     *            3/__\_\ 2
     *           0/____\/1
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class MeshPyramid extends Mesh {
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
                // floor
                /*0*/ -1, 0, 1, /*1*/ 1, 0, 1,  /*2*/ 1, 0, -1, /*3*/ -1, 0, -1,
                // tip
                /*4*/ 0, 2, 0  // double height will be scaled down
            ]);

            // scale down to a length of 1 for bottom edges and height
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }

        protected createIndices(): Uint16Array {
            let indices: Uint16Array = new Uint16Array([
                // front
                4, 0, 1,
                // right
                4, 1, 2,
                // back
                4, 2, 3,
                // left
                4, 3, 0,
                // bottom
                0, 2, 1, 0, 3, 2
            ]);
            return indices;
        }

        protected createTextureUVs(): Float32Array {
            let textureUVs: Float32Array = new Float32Array([
                // front
                /*0*/ 0, 1, /*1*/ 0.5, 1,  /*2*/ 1, 1, /*3*/ 0.5, 1,
                // back
                /*4*/ 0.5, 0
            ]);
            return textureUVs;
        }

        protected createFaceNormals(): Float32Array { return null; }
    }
}