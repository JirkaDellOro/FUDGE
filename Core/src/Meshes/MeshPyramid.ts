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
            this.normalsFace = this.createFaceNormals();
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
                /*4*/ 0, 2, 0,  // double height will be scaled down
                // floor again for texturing and normals
                /*5*/ -1, 0, 1, /*6*/ 1, 0, 1,  /*7*/ 1, 0, -1, /*8*/ -1, 0, -1
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
                5 + 0, 5 + 2, 5 + 1, 5 + 0, 5 + 3, 5 + 2
            ]);
            return indices;
        }

        protected createTextureUVs(): Float32Array {
            let textureUVs: Float32Array = new Float32Array([
                // front
                /*0*/ 0, 1, /*1*/ 0.5, 1,  /*2*/ 1, 1, /*3*/ 0.5, 1,
                // back
                /*4*/ 0.5, 0,
                /*5*/ 0, 0, /*6*/ 1, 0,  /*7*/ 1, 1, /*8*/ 0, 1
            ]);
            return textureUVs;
        }

        protected createFaceNormals(): Float32Array {
            let normals: number[] = [];
            let vertices: Vector3[] = [];

            for (let v: number = 0; v < this.vertices.length; v += 3)
                vertices.push(new Vector3(this.vertices[v], this.vertices[v + 1], this.vertices[v + 2]));

            for (let i: number = 0; i < this.indices.length; i += 3) {
                let vertex: number[] = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];
                let v0: Vector3 = Vector3.subtract(vertices[vertex[0]], vertices[vertex[1]]);
                let v1: Vector3 = Vector3.subtract(vertices[vertex[0]], vertices[vertex[2]]);
                let normal: Vector3 = Vector3.normalize(Vector3.cross(v0, v1));
                let index: number = vertex[2] * 3;
                normals[index] = normal.x;
                normals[index + 1] = normal.y;
                normals[index + 2] = normal.z;
            }
            normals.push(0, 0, 0);
            return new Float32Array(normals);
        }
    }
}