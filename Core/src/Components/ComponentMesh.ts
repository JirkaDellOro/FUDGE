namespace Fudge {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentMesh extends Component {
        private mesh: Mesh = null;
        // private vertices: Float32Array; // The Mesh's vertexpositions.
        // private vertexCount: number; // The amount of Vertices that need to be drawn.
        // private bufferSpecification: BufferSpecification; // The dataspecifications for the vertexbuffer.
        // private normals: Float32Array; // The normals for each vertex. (As of yet, they are not used, but they are necessary for shading with a lightsource)

        public setMesh(_mesh: Mesh): void {
            this.mesh = _mesh;
            // this.initialize();
        }
        public getMesh(): Mesh {
            return this.mesh;
        }

        // public getBufferSpecification(): BufferSpecification {
        //     return this.bufferSpecification;
        // }
        // public getVertexCount(): number {
        //     return this.vertexCount;
        // }
        // public getNormals(): Float32Array {
        //     return this.normals;
        // }


        // /**
        //  * Sets the color for each vertex to the referenced material's color and supplies the data to the colorbuffer.
        //  * @param _materialComponent The materialcomponent attached to the same node.
        //  */
        // public applyColor(_materialComponent: ComponentMaterial): void {

        //     let colorPerPosition: number[] = [];
        //     for (let i: number = 0; i < this.vertexCount; i++) {
        //         colorPerPosition.push(_materialComponent.Material.Color.x, _materialComponent.Material.Color.y, _materialComponent.Material.Color.z);
        //     }
        //     gl2.bufferData(gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), gl2.STATIC_DRAW);
        // }

        // /**
        //  * Generates UV coordinates for the texture based on the vertices of the mesh the texture was added to.
        //  */
        // public setTextureCoordinates(): void {
        //     let textureCoordinates: number[] = [];
        //     let quadCount: number = this.vertexCount / 6;
        //     for (let i: number = 0; i < quadCount; i++) {
        //         textureCoordinates.push(
        //             0, 1,
        //             1, 1,
        //             0, 0,
        //             0, 0,
        //             1, 1,
        //             1, 0
        //         );
        //     }
        //     gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl2.STATIC_DRAW);
        // }

        public serialize(): Serialization {
            let serialization: Serialization = {
                mesh: this.mesh.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        public deserialize(_serialization: Serialization): Serializable {
            let mesh: Mesh = <Mesh>Serializer.deserialize(_serialization.mesh);
            this.setMesh(mesh);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }

        // /**
        //  * Computes the normal for each triangle of this mesh and applies it to each of the triangles vertices.
        //  */
        // private computeNormals(): Float32Array {
        //     let normals: number[] = [];
        //     let normal: Vector3 = new Vector3;
        //     let p: Float32Array = this.vertices;
        //     for (let i: number = 0; i < p.length; i += 9) {
        //         let vector1: Vector3 = new Vector3(p[i + 3] - p[i], p[i + 4] - p[i + 1], p[i + 5] - p[i + 2]);
        //         let vector2: Vector3 = new Vector3(p[i + 6] - p[i], p[i + 7] - p[i + 1], p[i + 8] - p[i + 2]);
        //         normal = Vector3.normalize(Vector3.cross(vector1, vector2));
        //         normals.push(normal.x, normal.y, normal.z);
        //         normals.push(normal.x, normal.y, normal.z);
        //         normals.push(normal.x, normal.y, normal.z);
        //     }
        //     return new Float32Array(normals);
        // }

        // private initialize(_size: number = 3, _dataType: number = gl2.FLOAT, _normalize: boolean = false): void {
        //     this.vertices = this.mesh.getVertices();
        //     this.bufferSpecification = {
        //         size: _size,
        //         dataType: _dataType,
        //         normalize: _normalize,
        //         stride: 0,
        //         offset: 0
        //     };
        //     this.vertexCount = this.vertices.length / this.bufferSpecification.size;
        //     if ((this.vertexCount % this.bufferSpecification.size) != 0) {
        //         console.log(this.vertexCount);
        //         throw new Error("Number of entries in positions[] and size do not match.");
        //     }
        //     this.normals = this.computeNormals();
        // }
    }
}
