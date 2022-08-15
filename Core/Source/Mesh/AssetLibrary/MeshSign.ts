namespace FudgeCore {

    export class MeshSign extends Mesh {
        public static readonly iSubclass: number = Mesh.registerSubclass(MeshSign);

        // private bladeLength: number = 0;
        // private bladeWidth: number = 0;
        // private handleWidth: number = 0;

        public constructor(_name: string = "StrMeshSignassenschild", /*_bladeLength: number = 0, _bladeWidth: number = 0, _handleWidth: number = 0*/) {
            super(_name);
            // this.create(_bladeLength, _bladeWidth, _handleWidth);
            

            this.vertices = new Vertices(

                // public create(_bladeLength: number, _bladeWidth: number, _handleWidth: number): void {
                //     this.clear();
                //     this.vertices = new Vertices(
            
                new Vertex(new Vector3(0.050668, 4.433600, -6.445390), new Vector2(1.000000, 0.500000)),
                new Vertex(new Vector3(-0.050668, 4.433600, -6.445390), new Vector2(0.000000, 0.500000)),
                new Vertex(new Vector3(0.050668, 4.050917, -6.369269), new Vector2(0.750000, 0.490000)),
                new Vertex(new Vector3(-0.050668, 4.050917, -6.369269), new Vector2(1.000000, 1.000000)),
                new Vertex(new Vector3(0.050668, 3.726494, -6.152496), new Vector2(0.250000, 0.490000)),
                new Vertex(new Vector3(-0.050669, 3.726494, -6.152496), new Vector2(0.000000, 1.000000)),
                new Vertex(new Vector3(0.050668, 3.509721, -5.828073), new Vector2(0.937500, 0.500000)),
                new Vertex(new Vector3(-0.050669, 3.509721, -5.828073), new Vector2(0.841844, 0.471731)),
                new Vertex(new Vector3(0.050668, 3.433600, -5.445390), new Vector2(0.937500, 1.000000)),
                new Vertex(new Vector3(-0.050669, 3.433600, -5.445390), new Vector2(0.341844, 0.471731)),
                new Vertex(new Vector3(0.050668, 3.509721, -5.062706), new Vector2(0.875000, 0.500000)),
                new Vertex(new Vector3(-0.050669, 3.509721, -5.062706), new Vector2(0.919706, 0.419706)),
                new Vertex(new Vector3(0.050668, 3.726494, -4.738283), new Vector2(0.875000, 1.000000)),
                new Vertex(new Vector3(-0.050669, 3.726494, -4.738283), new Vector2(0.419706, 0.419706)),
                new Vertex(new Vector3(0.050668, 4.050917, -4.521510), new Vector2(0.812500, 0.500000)),
                new Vertex(new Vector3(-0.050668, 4.050917, -4.521510), new Vector2(0.971731, 0.341844)),
                new Vertex(new Vector3(0.050668, 4.433600, -4.445390), new Vector2(0.812500, 1.000000)),
                new Vertex(new Vector3(-0.050668, 4.433600, -4.445390), new Vector2(0.471731, 0.341844)),
                new Vertex(new Vector3(0.050668, 4.816284, -4.521510), new Vector2(0.750000, 0.500000)),
                new Vertex(new Vector3(-0.050668, 4.816284, -4.521510), new Vector2(0.990000, 0.250000)),
                new Vertex(new Vector3(0.050669, 5.140707, -4.738283), new Vector2(0.750000, 1.000000)),
                new Vertex(new Vector3(-0.050668, 5.140707, -4.738283), new Vector2(0.490000, 0.250000)),
                new Vertex(new Vector3(0.050669, 5.357480, -5.062706), new Vector2(0.687500, 0.500000)),
                new Vertex(new Vector3(-0.050668, 5.357480, -5.062706), new Vector2(0.971731, 0.158156)),
                new Vertex(new Vector3(0.050669, 5.433600, -5.445390), new Vector2(0.687500, 1.000000)),
                new Vertex(new Vector3(-0.050668, 5.433600, -5.445390), new Vector2(0.471731, 0.158156)),
                new Vertex(new Vector3(0.050669, 5.357480, -5.828074), new Vector2(0.625000, 0.500000)),
                new Vertex(new Vector3(-0.050668, 5.357480, -5.828074), new Vector2(0.919706, 0.080294)),
                new Vertex(new Vector3(0.050669, 5.140707, -6.152496), new Vector2(0.625000, 1.000000)),
                new Vertex(new Vector3(-0.050668, 5.140707, -6.152496), new Vector2(0.419706, 0.080294)),
                new Vertex(new Vector3(0.050668, 4.816284, -6.369269), new Vector2(0.562500, 0.500000)),
                new Vertex(new Vector3(-0.050668, 4.816284, -6.369269), new Vector2(0.841844, 0.028269)),
                new Vertex(new Vector3(-0.131498, -0.771100, -5.374990), new Vector2(0.562500, 1.000000)),
                new Vertex(new Vector3(-0.131498, 4.420254, -5.374990), new Vector2(0.341844, 0.028269)),
                new Vertex(new Vector3(-0.131498, -0.771100, -5.515790), new Vector2(0.500000, 0.500000)),
                new Vertex(new Vector3(-0.131498, 4.420254, -5.515790), new Vector2(0.750000, 0.010000)),
                new Vertex(new Vector3(-0.050238, -0.771100, -5.374990), new Vector2(0.500000, 1.000000)),
                new Vertex(new Vector3(-0.050238, 4.420254, -5.374990), new Vector2(0.250000, 0.010000)),
                new Vertex(new Vector3(-0.050238, -0.771100, -5.515790), new Vector2(0.437500, 0.500000)),
                new Vertex(new Vector3(-0.050238, 4.420254, -5.515790), new Vector2(0.658156, 0.028269)),

            )
            this.faces = [
                new Face(this.vertices, 1, 0, 2),
                new Face(this.vertices, 3, 2, 4),
                new Face(this.vertices, 5, 4, 6),
                new Face(this.vertices, 7, 6, 8),
                new Face(this.vertices, 9, 8, 10),
                new Face(this.vertices, 11, 10, 12),
                new Face(this.vertices, 13, 12, 14),
                new Face(this.vertices, 15, 14, 16),
                new Face(this.vertices, 17, 16, 18),
                new Face(this.vertices, 19, 18, 20),
                new Face(this.vertices, 21, 20, 22),
                new Face(this.vertices, 23, 22, 24),
                new Face(this.vertices, 25, 24, 26),
                new Face(this.vertices, 27, 26, 28),
                new Face(this.vertices, 5, 21, 29),
                new Face(this.vertices, 29, 28, 30),
                new Face(this.vertices, 31, 30, 0),
                new Face(this.vertices, 6, 22, 14),
                new Face(this.vertices, 33, 32, 34),
                new Face(this.vertices, 34, 38, 39),
                new Face(this.vertices, 39, 38, 36),
                new Face(this.vertices, 37, 36, 32),
                new Face(this.vertices, 38, 34, 32),
                new Face(this.vertices, 35, 39, 37),
                new Face(this.vertices, 1, 2, 3),
                new Face(this.vertices, 3, 4, 5),
                new Face(this.vertices, 5, 6, 7),
                new Face(this.vertices, 7, 8, 9),
                new Face(this.vertices, 9, 10, 11),
                new Face(this.vertices, 11, 12, 13),
                new Face(this.vertices, 13, 14, 15),
                new Face(this.vertices, 15, 16, 17),
                new Face(this.vertices, 17, 18, 19),
                new Face(this.vertices, 19, 20, 21),
                new Face(this.vertices, 21, 22, 23),
                new Face(this.vertices, 23, 24, 25),
                new Face(this.vertices, 25, 26, 27),
                new Face(this.vertices, 27, 28, 29),
                new Face(this.vertices, 5, 1, 3),
                new Face(this.vertices, 1, 29, 31),
                new Face(this.vertices, 29, 21, 27),
                new Face(this.vertices, 27, 21, 25),
                new Face(this.vertices, 25, 21, 23),
                new Face(this.vertices, 21, 17, 19),
                new Face(this.vertices, 17, 13, 15),
                new Face(this.vertices, 13, 9, 11),
                new Face(this.vertices, 9, 13, 7),
                new Face(this.vertices, 7, 13, 5),
                new Face(this.vertices, 5, 29, 1),
                new Face(this.vertices, 21, 5, 17),
                new Face(this.vertices, 17, 5, 13),
                new Face(this.vertices, 29, 30, 31),
                new Face(this.vertices, 31, 0, 1),
                new Face(this.vertices, 30, 6, 0),
                new Face(this.vertices, 0, 6, 2),
                new Face(this.vertices, 2, 6, 4),
                new Face(this.vertices, 6, 10, 8),
                new Face(this.vertices, 10, 14, 12),
                new Face(this.vertices, 14, 18, 16),
                new Face(this.vertices, 18, 22, 20),
                new Face(this.vertices, 22, 26, 24),
                new Face(this.vertices, 26, 22, 28),
                new Face(this.vertices, 28, 22, 30),
                new Face(this.vertices, 6, 14, 10),
                new Face(this.vertices, 14, 22, 18),
                new Face(this.vertices, 30, 22, 6),
                new Face(this.vertices, 33, 34, 35),
                new Face(this.vertices, 34, 39, 35),
                new Face(this.vertices, 39, 36, 37),
                new Face(this.vertices, 37, 32, 33),
                new Face(this.vertices, 38, 32, 36),
                new Face(this.vertices, 35, 37, 33),
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
           //this.create(this.bladeLength, this.bladeWidth, this.handleWidth);
          }
    }
}