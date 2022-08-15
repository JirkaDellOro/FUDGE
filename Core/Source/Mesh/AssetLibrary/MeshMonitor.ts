namespace FudgeCore {

    export class MeshMonitor extends MeshMutable {
        public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshMonitor);

        public constructor(_name: string = "MeshMonitor") {
            super(_name);
            // this.create();

            this.vertices = new Vertices(

                new Vertex(new Vector3(-0.350000, -0.203318, 0.032608), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(-0.350000, 0.203318, 0.032608), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(-0.333885, -0.193957, -0.032608), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-0.333885, 0.193957, -0.032608), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(0.350000, -0.203318, 0.032608), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(0.350000, 0.203318, 0.032608), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(0.333885, -0.193957, -0.032608), new Vector2(0.380755, 0.255755)),
                new Vertex(new Vector3(0.333885, 0.193957, -0.032608), new Vector2(0.619245, 0.255755)),
                new Vertex(new Vector3(-0.042359, -0.203318, 0.019987), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-0.042359, -0.203318, -0.019987), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(0.042359, -0.203318, 0.019987), new Vector2(0.380755, 0.494245)),
                new Vertex(new Vector3(0.042359, -0.203318, -0.019987), new Vector2(0.619245, 0.494245)),
                new Vertex(new Vector3(-0.350000, 0.203318, -0.032608), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-0.350000, -0.203318, -0.032608), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(0.350000, -0.203318, -0.032608), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(0.350000, 0.203318, -0.032608), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-0.333885, 0.193957, -0.008635), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-0.333885, -0.193957, -0.008635), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(0.333885, -0.193957, -0.008635), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(0.333885, 0.193957, -0.008635), new Vector2(0.375000, 0.250000)),
                new Vertex(new Vector3(-0.042359, -0.275358, -0.019987), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-0.042359, -0.275358, 0.019987), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(0.042359, -0.275358, -0.019987), new Vector2(0.619245, 0.255755)),
                new Vertex(new Vector3(0.042359, -0.275358, 0.019987), new Vector2(0.380755, 0.255755)),
                new Vertex(new Vector3(-0.095946, -0.275358, -0.075000), new Vector2(0.380755, 0.494245)),
                new Vertex(new Vector3(-0.095946, -0.275358, 0.075000), new Vector2(0.619245, 0.494245)),
                new Vertex(new Vector3(0.095946, -0.275358, -0.075000), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(0.095946, -0.275358, 0.075000), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-0.095946, -0.296682, -0.075000), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-0.095946, -0.296682, 0.075000), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(0.095946, -0.296682, -0.075000), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(0.095946, -0.296682, 0.075000), new Vector2(0.125000, 0.750000)),
            )
            this.faces = [
                new Face(this.vertices, 1, 13, 0),
                new Face(this.vertices, 7, 16, 3),
                new Face(this.vertices, 15, 4, 14),
                new Face(this.vertices, 5, 0, 4),
                new Face(this.vertices, 14, 0, 13),
                new Face(this.vertices, 12, 5, 15),
                new Face(this.vertices, 8, 11, 9),
                new Face(this.vertices, 2, 12, 3),
                new Face(this.vertices, 6, 13, 2),
                new Face(this.vertices, 3, 15, 7),
                new Face(this.vertices, 7, 14, 6),
                new Face(this.vertices, 16, 18, 17),
                new Face(this.vertices, 3, 17, 2),
                new Face(this.vertices, 6, 19, 7),
                new Face(this.vertices, 2, 18, 6),
                new Face(this.vertices, 22, 21, 20),
                new Face(this.vertices, 8, 23, 10),
                new Face(this.vertices, 11, 20, 9),
                new Face(this.vertices, 10, 22, 11),
                new Face(this.vertices, 9, 21, 8),
                new Face(this.vertices, 25, 26, 24),
                new Face(this.vertices, 30, 29, 28),
                new Face(this.vertices, 27, 30, 26),
                new Face(this.vertices, 24, 29, 25),
                new Face(this.vertices, 25, 31, 27),
                new Face(this.vertices, 26, 28, 24),
                new Face(this.vertices, 1, 12, 13),
                new Face(this.vertices, 7, 19, 16),
                new Face(this.vertices, 15, 5, 4),
                new Face(this.vertices, 5, 1, 0),
                new Face(this.vertices, 14, 4, 0),
                new Face(this.vertices, 12, 1, 5),
                new Face(this.vertices, 8, 10, 11),
                new Face(this.vertices, 2, 13, 12),
                new Face(this.vertices, 6, 14, 13),
                new Face(this.vertices, 3, 12, 15),
                new Face(this.vertices, 7, 15, 14),
                new Face(this.vertices, 16, 19, 18),
                new Face(this.vertices, 3, 16, 17),
                new Face(this.vertices, 6, 18, 19),
                new Face(this.vertices, 2, 17, 18),
                new Face(this.vertices, 22, 23, 21),
                new Face(this.vertices, 8, 21, 23),
                new Face(this.vertices, 11, 22, 20),
                new Face(this.vertices, 10, 23, 22),
                new Face(this.vertices, 9, 20, 21),
                new Face(this.vertices, 25, 27, 26),
                new Face(this.vertices, 30, 31, 29),
                new Face(this.vertices, 27, 31, 30),
                new Face(this.vertices, 24, 28, 29),
                new Face(this.vertices, 25, 29, 31),
                new Face(this.vertices, 26, 30, 28),

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