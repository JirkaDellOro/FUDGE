namespace Fudge {
    /**
     * Simple class to compute the vertexpositions for a box.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class MeshQuad extends Mesh {
        public constructor() {
            super();
            this.create();
        }

        public create(): void {
            this.vertices = new Float32Array([
                -1, -1, 1, /**/ 1, -1, 1,  /**/ -1, 1, 1, /**/ -1, 1, 1, /**/ 1, -1, 1, /**/ 1, 1, 1
            ]);

            for (let iVertex: number = 0; iVertex < this.vertices.length; iVertex += 3) {
                this.vertices[iVertex] *= 1 / 2;
                this.vertices[iVertex + 1] *= 1 / 2;
                this.vertices[iVertex + 2] *= 1 / 2;
            }
        }

        public setTextureCoordinates(): void {
            let textureCoordinates: number[] = [];
            textureCoordinates.push(
                0, 1,
                1, 1,
                0, 0,
                0, 0,
                1, 1,
                1, 0
            );
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
    }
}