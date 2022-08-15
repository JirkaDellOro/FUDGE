namespace FudgeCore {

    export class MeshCabinet extends Mesh {
        public static readonly iSubclass: number = Mesh.registerSubclass(MeshCabinet);

        public constructor(_name: string = "MeshCabinet") {
            super(_name);
            // this.create();

            this.vertices = new Vertices(
                // ground vertices
                new Vertex(new Vector3(-0.750000, -1.000000, 0.296299), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(-0.750000, 1.000000, 0.296299), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(-0.712114, -0.949486, -0.687780), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-0.712114, 0.949486, -0.687780), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(0.750000, -1.000000, 0.296299), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(0.750000, 1.000000, 0.296299), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(0.712114, -0.949486, -0.687780), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.712114, 0.949486, -0.687780), new Vector2(0.618686, 0.256314)),
                new Vertex(new Vector3(-0.750000, 1.000000, -0.687780), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-0.750000, -1.000000, -0.687780), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(0.750000, -1.000000, -0.687780), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(0.750000, 1.000000, -0.687780), new Vector2(0.618686, 0.493686)),
                new Vertex(new Vector3(-0.712114, 0.949486, 0.224157), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-0.712114, -0.949486, 0.224157), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(0.712114, -0.949486, 0.224157), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(0.712114, 0.949486, 0.224157), new Vector2(0.375000, 0.250000)),
                new Vertex(new Vector3(-0.712114, 0.000000, -0.687780), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(0.712114, 0.000000, -0.687780), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(-0.712114, 0.000000, 0.224157), new Vector2(0.618686, 0.256314)),
                new Vertex(new Vector3(0.712114, 0.000000, 0.224157), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.712114, -0.036009, -0.687780), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(-0.712114, -0.036009, -0.687780), new Vector2(0.618686, 0.493686)),
                new Vertex(new Vector3(0.712114, -0.036009, 0.224157), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(-0.712114, -0.036009, 0.224157), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(-0.712114, 0.518005, -0.687780), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.712114, 0.518005, -0.687780), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(-0.712114, 0.518005, 0.224157), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(0.712114, 0.518005, 0.224157), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.712114, 0.481995, -0.687780), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(-0.712114, 0.481995, -0.687780), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.712114, 0.481995, 0.224157), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(-0.712114, 0.481995, 0.224157), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(-0.685228, -0.481995, -0.703701), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.739001, -0.481995, -0.703701), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(-0.685228, -0.481995, 0.208235), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(0.739001, -0.481995, 0.208235), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.739001, -0.518005, -0.703701), new Vector2(0.381314, 0.493686)),
                new Vertex(new Vector3(-0.685228, -0.518005, -0.703701), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(0.739001, -0.518005, 0.208235), new Vector2(0.381314, 0.256314)),
                new Vertex(new Vector3(-0.685228, -0.518005, 0.208235), new Vector2(0.381314, 0.493686)),


            )
            this.faces = [
                new Face(this.vertices, 1, 9, 0),
                new Face(this.vertices, 7, 12, 3),
                new Face(this.vertices, 11, 4, 10),
                new Face(this.vertices, 5, 0, 4),
                new Face(this.vertices, 10, 0, 9),
                new Face(this.vertices, 8, 5, 11),
                new Face(this.vertices, 2, 8, 3),
                new Face(this.vertices, 6, 9, 2),
                new Face(this.vertices, 3, 11, 7),
                new Face(this.vertices, 7, 10, 6),
                new Face(this.vertices, 12, 14, 13),
                new Face(this.vertices, 3, 13, 2),
                new Face(this.vertices, 6, 15, 7),
                new Face(this.vertices, 2, 14, 6),
                new Face(this.vertices, 19, 16, 17),
                new Face(this.vertices, 21, 22, 20),
                new Face(this.vertices, 18, 21, 16),
                new Face(this.vertices, 16, 20, 17),
                new Face(this.vertices, 17, 22, 19),
                new Face(this.vertices, 19, 23, 18),
                new Face(this.vertices, 27, 24, 25),
                new Face(this.vertices, 29, 30, 28),
                new Face(this.vertices, 26, 29, 24),
                new Face(this.vertices, 24, 28, 25),
                new Face(this.vertices, 25, 30, 27),
                new Face(this.vertices, 27, 31, 26),
                new Face(this.vertices, 35, 32, 33),
                new Face(this.vertices, 37, 38, 36),
                new Face(this.vertices, 34, 37, 32),
                new Face(this.vertices, 32, 36, 33),
                new Face(this.vertices, 33, 38, 35),
                new Face(this.vertices, 35, 39, 34),
                new Face(this.vertices, 1, 8, 9),
                new Face(this.vertices, 7, 15, 12),
                new Face(this.vertices, 11, 5, 4),
                new Face(this.vertices, 5, 1, 0),
                new Face(this.vertices, 10, 4, 0),
                new Face(this.vertices, 8, 1, 5),
                new Face(this.vertices, 2, 9, 8),
                new Face(this.vertices, 6, 10, 9),
                new Face(this.vertices, 3, 8, 11),
                new Face(this.vertices, 7, 11, 10),
                new Face(this.vertices, 12, 15, 14),
                new Face(this.vertices, 3, 12, 13),
                new Face(this.vertices, 6, 14, 15),
                new Face(this.vertices, 2, 13, 14),
                new Face(this.vertices, 19, 18, 16),
                new Face(this.vertices, 21, 23, 22),
                new Face(this.vertices, 18, 23, 21),
                new Face(this.vertices, 16, 21, 20),
                new Face(this.vertices, 17, 20, 22),
                new Face(this.vertices, 19, 22, 23),
                new Face(this.vertices, 27, 26, 24),
                new Face(this.vertices, 29, 31, 30),
                new Face(this.vertices, 26, 31, 29),
                new Face(this.vertices, 24, 29, 28),
                new Face(this.vertices, 25, 28, 30),
                new Face(this.vertices, 27, 30, 31),
                new Face(this.vertices, 35, 34, 32),
                new Face(this.vertices, 37, 39, 38),
                new Face(this.vertices, 34, 39, 37),
                new Face(this.vertices, 32, 37, 36),
                new Face(this.vertices, 33, 36, 38),
                new Face(this.vertices, 35, 38, 39),
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