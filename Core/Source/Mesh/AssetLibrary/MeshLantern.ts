namespace FudgeCore {

  export class MeshLantern extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshLantern);

    private lanternLength: number = 0;
    private mastLength: number = 0;
    private lanternWidth: number = 0;


    public constructor(_name: string = "MeshLantern", _lanternLength: number = 0, _mastLength: number = 0, _lanternWidth: number = 0,) {
      super(_name);
      this.create(_lanternLength, _mastLength, _lanternWidth);

    }
    public create(_lanternLength: number, _mastLength: number, _lanternWidth: number): void {
      this.clear();

      this.vertices = new Vertices(
        // ground vertices
        new Vertex(new Vector3(0.144804, 1.690348, -0.144804), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(0.144804, -2.514889-(this.mastLength / 2), -0.144804), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(0.144804, 1.690348, 0.144804), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(0.144804, -2.514889-(this.mastLength / 2), 0.144804), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-0.144804, 1.690348, -0.144804), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(-0.144804, -2.514889-(this.mastLength / 2), -0.144804), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(-0.144804, 1.690348, 0.144804), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(-0.144804, -2.514889-(this.mastLength / 2), 0.144804), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(0.217190+(this.lanternWidth / 2), 2.668431+(this.lanternLength / 2), 0.217190+(this.lanternWidth / 2)), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(-0.217190-(this.lanternWidth / 2), 2.668431+(this.lanternLength / 2), 0.217190+(this.lanternWidth / 2)), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(0.217190+(this.lanternWidth / 2), 2.668431+(this.lanternLength / 2), -0.217190-(this.lanternWidth / 2)), new Vector2(0.684969, 0.690031)),
        new Vertex(new Vector3(-0.217190-(this.lanternWidth / 2), 2.668431+(this.lanternLength / 2), -0.217190-(this.lanternWidth / 2)), new Vector2(0.815031, 0.690031)),
        new Vertex(new Vector3(0.267821+(this.lanternWidth / 2), 1.745819-(this.lanternLength / 2), 0.267821+(this.lanternWidth / 2)), new Vector2(0.684969, 0.559969)),
        new Vertex(new Vector3(-0.267821-(this.lanternWidth / 2), 1.745819-(this.lanternLength / 2), 0.267821+(this.lanternWidth / 2)), new Vector2(0.815031, 0.559969)),
        new Vertex(new Vector3(-0.267821-(this.lanternWidth / 2), 1.745819-(this.lanternLength / 2), -0.267821-(this.lanternWidth / 2)), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(0.267821+(this.lanternWidth / 2), 1.745819-(this.lanternLength / 2), -0.267821-(this.lanternWidth / 2)), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(0.417476+(this.lanternWidth / 2), 2.384055, 0.417476+(this.lanternWidth / 2)), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(-0.417476-(this.lanternWidth / 2), 2.384055, 0.417476+(this.lanternWidth / 2)), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(0.417476+(this.lanternWidth / 2), 2.384055, -0.417476-(this.lanternWidth / 2)), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(-0.417476-(this.lanternWidth / 2), 2.384055, -0.417476-(this.lanternWidth / 2)), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(-0.365041, -2.514889-(this.mastLength / 2), -0.349188), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(-0.365041, -2.514889-(this.mastLength / 2), 0.349188), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(0.365041, -2.514889-(this.mastLength / 2), -0.349188), new Vector2(0.875000, 0.750000)),
        new Vertex(new Vector3(0.365041, -2.514889-(this.mastLength / 2), 0.349188), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(-0.365041, -2.634316-(this.mastLength / 2), -0.349188), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(-0.365041, -2.634316-(this.mastLength / 2), 0.349188), new Vector2(0.875000, 0.500000)),
        new Vertex(new Vector3(0.365041, -2.634316-(this.mastLength / 2), -0.349188), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(0.365041, -2.634316-(this.mastLength / 2), 0.349188), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(0.144804, 1.690343, 0.144804), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(-0.144804, 1.690343, 0.144804), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(0.144804, 1.690343, -0.144804), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-0.144804, 1.690343, -0.144804), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(-0.144804, -2.514901-(this.mastLength / 2), -0.144804), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(-0.144804, -2.514901-(this.mastLength / 2), 0.144804), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(0.144804, -2.514901-(this.mastLength / 2), -0.144804), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(0.144804, -2.514901-(this.mastLength / 2), 0.144804), new Vector2(0.375000, 0.000000)),
      )
      this.faces = [
        new Face(this.vertices, 12, 17, 13),
        new Face(this.vertices, 28, 33, 35),
        new Face(this.vertices, 29, 32, 33),
        new Face(this.vertices, 5, 21, 7),
        new Face(this.vertices, 30, 35, 34),
        new Face(this.vertices, 31, 34, 32),
        new Face(this.vertices, 11, 8, 10),
        new Face(this.vertices, 13, 19, 14),
        new Face(this.vertices, 15, 16, 12),
        new Face(this.vertices, 14, 18, 15),
        new Face(this.vertices, 4, 15, 0),
        new Face(this.vertices, 0, 12, 2),
        new Face(this.vertices, 6, 14, 4),
        new Face(this.vertices, 6, 12, 13),
        new Face(this.vertices, 8, 17, 16),
        new Face(this.vertices, 8, 18, 10),
        new Face(this.vertices, 11, 17, 9),
        new Face(this.vertices, 11, 18, 19),
        new Face(this.vertices, 21, 27, 23),
        new Face(this.vertices, 3, 22, 1),
        new Face(this.vertices, 1, 20, 5),
        new Face(this.vertices, 7, 23, 3),
        new Face(this.vertices, 26, 25, 24),
        new Face(this.vertices, 20, 25, 21),
        new Face(this.vertices, 23, 26, 22),
        new Face(this.vertices, 22, 24, 20),
        new Face(this.vertices, 6, 0, 2),
        new Face(this.vertices, 30, 29, 28),
        new Face(this.vertices, 34, 33, 32),
        new Face(this.vertices, 7, 1, 5),
        new Face(this.vertices, 34, 35, 33),
        new Face(this.vertices, 12, 16, 17),
        new Face(this.vertices, 28, 29, 33),
        new Face(this.vertices, 29, 31, 32),
        new Face(this.vertices, 5, 20, 21),
        new Face(this.vertices, 30, 28, 35),
        new Face(this.vertices, 31, 30, 34),
        new Face(this.vertices, 11, 9, 8),
        new Face(this.vertices, 13, 17, 19),
        new Face(this.vertices, 15, 18, 16),
        new Face(this.vertices, 14, 19, 18),
        new Face(this.vertices, 4, 14, 15),
        new Face(this.vertices, 0, 15, 12),
        new Face(this.vertices, 6, 13, 14),
        new Face(this.vertices, 6, 2, 12),
        new Face(this.vertices, 8, 9, 17),
        new Face(this.vertices, 8, 16, 18),
        new Face(this.vertices, 11, 19, 17),
        new Face(this.vertices, 11, 10, 18),
        new Face(this.vertices, 21, 25, 27),
        new Face(this.vertices, 3, 23, 22),
        new Face(this.vertices, 1, 22, 20),
        new Face(this.vertices, 7, 21, 23),
        new Face(this.vertices, 26, 27, 25),
        new Face(this.vertices, 20, 24, 25),
        new Face(this.vertices, 23, 27, 26),
        new Face(this.vertices, 22, 26, 24),
        new Face(this.vertices, 6, 4, 0),
        new Face(this.vertices, 30, 31, 29),
        new Face(this.vertices, 7, 3, 1),
      ];
    }
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.lanternLength = this.lanternLength;
      serialization.mastLength = this.mastLength;
      serialization.lanternWidth = this.lanternWidth;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.lanternLength = _serialization.lanternLength;
      this.mastLength = _serialization.mastLength;
      this.lanternWidth = _serialization.lanternWidth;
      this.create(this.lanternLength, this.mastLength, this.lanternWidth);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.lanternLength, this.mastLength, this.lanternWidth);
    }
  }
}