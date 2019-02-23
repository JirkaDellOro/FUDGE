namespace WebEngine {

    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     */
    export class MeshComponent extends Component {

        private positions: Float32Array; // The Mesh's vertexpositions.
        private vertexCount: number; // The amount of Vertices that need to be drawn.
        private bufferSpecification: BufferSpecification; // The dataspecifications for the vertexbuffer.
        private normals: Float32Array; // The normals for each vertex. (As of yet, they are not used, but they are necessary for shading with a lightsource)

        public constructor(_positions: Float32Array, _size: number = 3, _dataType: number = gl2.FLOAT, _normalize: boolean = false) {
            super();
            this.name = "Mesh";
            this.positions = _positions;
            this.bufferSpecification = {
                size: _size,
                dataType: _dataType,
                normalize: _normalize,
                stride: 0,
                offset: 0,
            }
            this.vertexCount = this.positions.length / this.bufferSpecification.size;
            if ((this.vertexCount % this.bufferSpecification.size) != 0) {
                console.log(this.vertexCount);
                throw new Error("Number of entries in positions[] and size do not match.")
            }
            this.normals = this.computeNormals();
        }

        // Get and set methods.######################################################################################
        public get Positions(): Float32Array {
            return this.positions;
        }
        public get BufferSpecification(): BufferSpecification {
            return this.bufferSpecification;
        }
        public get VertexCount(): number {
            return this.vertexCount;
        }
        public get Normals(): Float32Array {
            return this.normals;
        }

        /**
         * Computes the normal for each triangle of this meshand applies it to each of the triangles vertices.
         */
        private computeNormals(): Float32Array {
            let normals: number[] = [];
            let normal: Vec3 = new Vec3;
            for (let i: number = 0; i < this.positions.length; i += 9) {
                let vector1: Vec3 = new Vec3(this.positions[i + 3] - this.positions[i], this.positions[i + 4] - this.positions[i + 1], this.positions[i + 5] - this.positions[i + 2])
                let vector2: Vec3 = new Vec3(this.positions[i + 6] - this.positions[i], this.positions[i + 7] - this.positions[i + 1], this.positions[i + 8] - this.positions[i + 2])
                normal = Vec3.normalize(Vec3.cross(vector1, vector2));
                normals.push(normal.X, normal.Y, normal.Z);
                normals.push(normal.X, normal.Y, normal.Z);
                normals.push(normal.X, normal.Y, normal.Z);
            }
            return new Float32Array(normals);
        }
                /**
         * Sets the color for each vertex to the referenced material's color and supplies the data to the colorbuffer.
         * @param _materialComponent The materialcomponent attached to the same fudgenode.
         */
        public applyColor(_materialComponent : MaterialComponent): void {

            let colorPerPosition: number[] = [];
            for (let i: number = 0; i < this.vertexCount; i++) {
                colorPerPosition.push(_materialComponent.Material.Color.X, _materialComponent.Material.Color.Y, _materialComponent.Material.Color.Z);
            }
            gl2.bufferData(gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), gl2.STATIC_DRAW)
        }

        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture
         * was added to.
         */
        public setTextureCoordinates(): void {
            let textureCoordinates: number[] = [];
            let quadCount: number = this.vertexCount / 6;
            for (let i: number = 0; i < quadCount; i++) {
                textureCoordinates.push(
                    0, 1,
                    1, 1,
                    0, 0,
                    0, 0,
                    1, 1,
                    1, 0,
                )
            }
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl2.STATIC_DRAW);
        }
    } // End class.
} // End namespace.
