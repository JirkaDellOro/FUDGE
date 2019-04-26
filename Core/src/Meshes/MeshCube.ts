namespace Fudge {
    /**
     * Simple class to compute the vertexpositions for a box.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class MeshCube extends Mesh {
        public width: number;
        public height: number;
        public depth: number;

        public constructor(_width: number, _height: number, _depth: number) {
            super();
            this.width = _width;
            this.height = _height;
            this.depth = _depth;
            this.create();
        }

        public create(): void {
            this.vertices = new Float32Array([
                //front
                -1, -1, 1, /**/ 1, -1, 1,  /**/ -1, 1, 1, /**/ -1, 1, 1, /**/ 1, -1, 1, /**/ 1, 1, 1,
                //back
                1, -1, -1, /**/ -1, -1, -1, /**/ 1, 1, -1, /**/ 1, 1, -1, /**/ -1, -1, -1, /**/ -1, 1, -1,
                //left
                -1, -1, -1, /**/ -1, -1, 1, /**/ -1, 1, -1, /**/ -1, 1, -1, /**/ -1, -1, 1, /**/ -1, 1, 1,
                //right
                1, -1, 1, /**/ 1, -1, -1, /**/ 1, 1, 1, /**/ 1, 1, 1, /**/ 1, -1, -1, /**/ 1, 1, -1,
                //top
                -1, 1, 1, /**/ 1, 1, 1, /**/ -1, 1, -1, /**/ -1, 1, -1, /**/ 1, 1, 1, /**/ 1, 1, -1,
                //bottom
                -1, -1, -1, /**/ 1, -1, -1, /**/ -1, -1, 1, /**/ -1, -1, 1, /**/ 1, -1, -1, /**/ 1, -1, 1
            ]);

            for (let iVertex: number = 0; iVertex < this.vertices.length; iVertex += 3) {
                this.vertices[iVertex] *= this.width / 2;
                this.vertices[iVertex + 1] *= this.height / 2;
                this.vertices[iVertex + 2] *= this.depth / 2;
            }
        }

        public serialize(): Serialization {
            let serialization: Serialization = {};
            serialization[this.constructor.name] = this;
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            this.width = _serialization.width;
            this.height = _serialization.height;
            this.depth = _serialization.depth;
            return this;
        }
    }
}