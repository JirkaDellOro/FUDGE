namespace FudgeCore {

    export class MeshLetterbox extends MeshMutable {
        public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshLetterbox);

        public constructor(_name: string = "MeshLetterbox") {
            super(_name);
            // this.create();

            this.vertices = new Vertices(

                new Vertex(new Vector3(-0.061036, -0.587505, 0.061036), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(-0.061036, 0.587505, 0.061036), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(-0.061036, -0.587505, -0.061036), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-0.061036, 0.587505, -0.061036), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(0.061036, -0.587505, 0.061036), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(0.061036, 0.587505, 0.061036), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(0.061036, -0.587505, -0.061036), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(0.061036, 0.587505, -0.061036), new Vector2(0.375000, 0.250000)),
                new Vertex(new Vector3(0.345270, 0.587505, 0.200894), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(0.345270, 0.587505, -0.200894), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-0.345270, 0.587505, 0.200894), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-0.345270, 0.587505, -0.200894), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(0.345270, 0.964849, 0.160746), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(0.345270, 0.964849, -0.160746), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(-0.345270, 0.964849, -0.160746), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(-0.345270, 0.964849, 0.160746), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(0.345270, 0.587505, 0.000000), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(-0.345270, 0.587505, 0.000000), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(0.345270, 1.024817, 0.000000), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(-0.345270, 1.024817, 0.000000), new Vector2(0.875000, 0.500000)),
            )

            this.faces = [
                new Face(this.vertices, 1, 2, 0),
                new Face(this.vertices, 3, 6, 2),
                new Face(this.vertices, 7, 4, 6),
                new Face(this.vertices, 5, 0, 4),
                new Face(this.vertices, 6, 0, 2),
                new Face(this.vertices, 3, 5, 7),
                new Face(this.vertices, 10, 16, 17),
                new Face(this.vertices, 18, 15, 19),
                new Face(this.vertices, 17, 14, 19),
                new Face(this.vertices, 16, 12, 18),
                new Face(this.vertices, 10, 12, 8),
                new Face(this.vertices, 9, 14, 11),
                new Face(this.vertices, 16, 13, 9),
                new Face(this.vertices, 17, 15, 10),
                new Face(this.vertices, 13, 19, 14),
                new Face(this.vertices, 17, 9, 11),
                new Face(this.vertices, 1, 3, 2),
                new Face(this.vertices, 3, 7, 6),
                new Face(this.vertices, 7, 5, 4),
                new Face(this.vertices, 5, 1, 0),
                new Face(this.vertices, 6, 4, 0),
                new Face(this.vertices, 3, 1, 5),
                new Face(this.vertices, 10, 8, 16),
                new Face(this.vertices, 18, 12, 15),
                new Face(this.vertices, 17, 11, 14),
                new Face(this.vertices, 16, 8, 12),
                new Face(this.vertices, 10, 15, 12),
                new Face(this.vertices, 9, 13, 14),
                new Face(this.vertices, 16, 18, 13),
                new Face(this.vertices, 17, 19, 15),
                new Face(this.vertices, 13, 18, 19),
                new Face(this.vertices, 17, 16, 9),
            ];
        }
        //         public serialize(): Serialization {
        //             let serialization: Serialization = super.serialize();
        //             serialization.bladeLength = this.bladeLength;
        //             serialization.bladeWidth = this.bladeWidth;
        //             serialization.handleWidth = this.handleWidth;
        //             return serialization;
        //           }
        //           public async deserialize(_serialization: Serialization): Promise<Serializable> {
        //             await super.deserialize(_serialization);
        //             this.bladeLength = _serialization.bladeLength;
        //             this.bladeWidth = _serialization.bladeWidth;
        //             this.handleWidth = _serialization.handleWidth;
        //             this.create(this.bladeLength, this.bladeWidth, this.handleWidth);
        //             return this;
        //           }

        public async mutate(_mutator: Mutator): Promise<void> {
            super.mutate(_mutator);
        }
    }
}