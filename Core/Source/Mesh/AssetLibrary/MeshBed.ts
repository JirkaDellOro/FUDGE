namespace FudgeCore {

    export class MeshBed extends Mesh {
        public static readonly iSubclass: number = Mesh.registerSubclass(MeshBed);

        public constructor(_name: string = "MeshBed") {
            super(_name);
            // this.create();

            this.vertices = new Vertices(
                // ground vertices
                new Vertex(new Vector3(-4.879208, -0.166403, 0.951090), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(-4.879208, 0.166403, 0.951090), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(-4.879208, -0.166403, -0.951090), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-4.879208, 0.166403, -0.951090), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(-3.679208, -0.166403, 0.951090), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(-3.679208, 0.166403, 0.951090), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(-3.679208, -0.166403, -0.951090), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(-3.679208, 0.166403, -0.951090), new Vector2(0.375000, 0.250000)),
                new Vertex(new Vector3(-3.857902, -0.393468, 0.892910), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(-3.857902, -0.166353, 0.892910), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-3.857902, -0.393468, 0.808700), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-3.857902, -0.166353, 0.808700), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(-3.771689, -0.393468, 0.892910), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-3.771689, -0.166353, 0.892910), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(-3.771689, -0.393468, 0.808700), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(-3.771689, -0.166353, 0.808700), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(-4.791006, -0.393468, 0.892910), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-4.791006, -0.166353, 0.892910), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(-4.791006, -0.393468, 0.808700), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(-4.791006, -0.166353, 0.808700), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(-4.704793, -0.393468, 0.892910), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(-4.704793, -0.166353, 0.892910), new Vector2(0.375000, 0.250000)),
                new Vertex(new Vector3(-4.704793, -0.393468, 0.808700), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(-4.704793, -0.166353, 0.808700), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-3.857902, -0.393468, -0.796854), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-3.857902, -0.166353, -0.796854), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(-3.857902, -0.393468, -0.881064), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-3.857902, -0.166353, -0.881064), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(-3.771689, -0.393468, -0.796854), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(-3.771689, -0.166353, -0.796854), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(-3.771689, -0.393468, -0.881064), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-3.771689, -0.166353, -0.881064), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(-4.791006, -0.393468, -0.796854), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(-4.791006, -0.166353, -0.796854), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(-4.791006, -0.393468, -0.881064), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(-4.791006, -0.166353, -0.881064), new Vector2(0.375000, 0.250000)),
                new Vertex(new Vector3(-4.704793, -0.393468, -0.796854), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(-4.704793, -0.166353, -0.796854), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-4.704793, -0.393468, -0.881064), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-4.704793, -0.166353, -0.881064), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(-4.629266, 0.166403, 0.880020), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-4.629266, 0.166403, 0.584129), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(-3.929149, 0.166403, 0.880020), new Vector2(0.375000, 0.000000)),
                new Vertex(new Vector3(-3.929149, 0.166403, 0.584129), new Vector2(0.375000, 1.000000)),
                new Vertex(new Vector3(-4.586183, 0.279081, 0.861811), new Vector2(0.125000, 0.750000)),
                new Vertex(new Vector3(-4.586183, 0.279081, 0.602337), new Vector2(0.625000, 0.000000)),
                new Vertex(new Vector3(-3.972233, 0.279081, 0.602337), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(-3.972233, 0.279081, 0.861811), new Vector2(0.875000, 0.750000)),
                new Vertex(new Vector3(-4.879208, -0.393698, 0.951090), new Vector2(0.125000, 0.500000)),
                new Vertex(new Vector3(-4.879208, 0.606302, 0.951090), new Vector2(0.375000, 0.250000)),
                new Vertex(new Vector3(-3.679208, -0.393698, 0.951090), new Vector2(0.625000, 0.250000)),
                new Vertex(new Vector3(-3.679208, 0.606302, 0.951090), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-4.879208, -0.393698, 1.048909), new Vector2(0.375000, 0.750000)),
                new Vertex(new Vector3(-4.879208, 0.606302, 1.048909), new Vector2(0.625000, 0.750000)),
                new Vertex(new Vector3(-3.679208, 0.606302, 1.048909), new Vector2(0.375000, 0.500000)),
                new Vertex(new Vector3(-3.679208, -0.393698, 1.048909), new Vector2(0.625000, 0.500000))

            )
            this.faces = [
                new Face(this.vertices, 1, 2, 0),
                new Face(this.vertices, 3, 6, 2),
                new Face(this.vertices, 7, 4, 6),
                new Face(this.vertices, 5, 0, 4),
                new Face(this.vertices, 6, 0, 2),
                new Face(this.vertices, 3, 5, 7),
                new Face(this.vertices, 9, 10, 8),
                new Face(this.vertices, 11, 14, 10),
                new Face(this.vertices, 15, 12, 14),
                new Face(this.vertices, 13, 8, 12),
                new Face(this.vertices, 14, 8, 10),
                new Face(this.vertices, 11, 13, 15),
                new Face(this.vertices, 17, 18, 16),
                new Face(this.vertices, 19, 22, 18),
                new Face(this.vertices, 23, 20, 22),
                new Face(this.vertices, 21, 16, 20),
                new Face(this.vertices, 22, 16, 18),
                new Face(this.vertices, 19, 21, 23),
                new Face(this.vertices, 25, 26, 24),
                new Face(this.vertices, 27, 30, 26),
                new Face(this.vertices, 31, 28, 30),
                new Face(this.vertices, 29, 24, 28),
                new Face(this.vertices, 30, 24, 26),
                new Face(this.vertices, 27, 29, 31),
                new Face(this.vertices, 33, 34, 32),
                new Face(this.vertices, 35, 38, 34),
                new Face(this.vertices, 39, 36, 38),
                new Face(this.vertices, 37, 32, 36),
                new Face(this.vertices, 38, 32, 34),
                new Face(this.vertices, 35, 37, 39),
                new Face(this.vertices, 42, 41, 43),
                new Face(this.vertices, 45, 47, 46),
                new Face(this.vertices, 43, 47, 42),
                new Face(this.vertices, 40, 45, 41),
                new Face(this.vertices, 42, 44, 40),
                new Face(this.vertices, 41, 46, 43),
                new Face(this.vertices, 48, 51, 50),
                new Face(this.vertices, 54, 52, 55),
                new Face(this.vertices, 49, 54, 51),
                new Face(this.vertices, 51, 55, 50),
                new Face(this.vertices, 50, 52, 48),
                new Face(this.vertices, 48, 53, 49),
                new Face(this.vertices, 1, 3, 2),
                new Face(this.vertices, 3, 7, 6),
                new Face(this.vertices, 7, 5, 4),
                new Face(this.vertices, 5, 1, 0),
                new Face(this.vertices, 6, 4, 0),
                new Face(this.vertices, 3, 1, 5),
                new Face(this.vertices, 9, 11, 10),
                new Face(this.vertices, 11, 15, 14),
                new Face(this.vertices, 15, 13, 12),
                new Face(this.vertices, 13, 9, 8),
                new Face(this.vertices, 14, 12, 8),
                new Face(this.vertices, 11, 9, 13),
                new Face(this.vertices, 17, 19, 18),
                new Face(this.vertices, 19, 23, 22),
                new Face(this.vertices, 23, 21, 20),
                new Face(this.vertices, 21, 17, 16),
                new Face(this.vertices, 22, 20, 16),
                new Face(this.vertices, 19, 17, 21),
                new Face(this.vertices, 25, 27, 26),
                new Face(this.vertices, 27, 31, 30),
                new Face(this.vertices, 31, 29, 28),
                new Face(this.vertices, 29, 25, 24),
                new Face(this.vertices, 30, 28, 24),
                new Face(this.vertices, 27, 25, 29),
                new Face(this.vertices, 33, 35, 34),
                new Face(this.vertices, 35, 39, 38),
                new Face(this.vertices, 39, 37, 36),
                new Face(this.vertices, 37, 33, 32),
                new Face(this.vertices, 38, 36, 32),
                new Face(this.vertices, 35, 33, 37),
                new Face(this.vertices, 42, 40, 41),
                new Face(this.vertices, 45, 44, 47),
                new Face(this.vertices, 43, 46, 47),
                new Face(this.vertices, 40, 44, 45),
                new Face(this.vertices, 42, 47, 44),
                new Face(this.vertices, 41, 45, 46),
                new Face(this.vertices, 48, 49, 51),
                new Face(this.vertices, 54, 53, 52),
                new Face(this.vertices, 49, 53, 54),
                new Face(this.vertices, 51, 54, 55),
                new Face(this.vertices, 50, 55, 52),
                new Face(this.vertices, 48, 52, 53),
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