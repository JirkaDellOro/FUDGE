namespace FudgeCore {

  export class MeshShield extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshShield);

    public constructor(_name: string = "MeshShield") {
      super(_name);
      // this.create();

      this.vertices = new Vertices(
        new Vertex(new Vector3(0.000000, 0.192429, 0.186539), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(0.000000, 0.375489, 0.186539), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(-0.431476, 0.364054, -0.613508), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(-0.431476, 0.547114, -0.613508), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(0.431476, 0.364054, -0.613508), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(0.431476, 0.547114, -0.613508), new Vector2(0.875000, 0.750000)),
        new Vertex(new Vector3(0.000000, 0.172735, -1.399488), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(0.000000, 0.355795, -1.399488), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(-1.824000, 0.369783, -0.610558), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(-0.571901, -0.096290, 2.320549), new Vector2(0.875000, 0.500000)),
        new Vertex(new Vector3(-0.571901, -0.336457, 2.320549), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-1.824000, 0.154685, -0.610558), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(0.571901, -0.096290, 2.320549), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(1.824000, 0.369783, -0.610558), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(1.824000, 0.154685, -0.610559), new Vector2(0.625000, 0.666667)),
        new Vertex(new Vector3(0.571901, -0.336457, 2.320549), new Vector2(0.625000, 0.583333)),
        new Vertex(new Vector3(0.711914, -0.446696, -3.310558), new Vector2(0.375000, 0.583333)),
        new Vertex(new Vector3(0.711914, -0.246696, -3.310558), new Vector2(0.375000, 0.666667)),
        new Vertex(new Vector3(0.313542, -0.542876, 2.820549), new Vector2(0.875000, 0.583333)),
        new Vertex(new Vector3(0.313542, -0.314844, 2.820549), new Vector2(0.625000, 0.166667)),
        new Vertex(new Vector3(-0.711915, -0.446696, -3.310558), new Vector2(0.875000, 0.666667)),
        new Vertex(new Vector3(-0.711915, -0.246696, -3.310558), new Vector2(0.625000, 0.083333)),
        new Vertex(new Vector3(-0.313542, -0.542876, 2.820549), new Vector2(0.125000, 0.666667)),
        new Vertex(new Vector3(-0.313542, -0.314844, 2.820549), new Vector2(0.375000, 0.083333))
       
      );
      this.faces = [
        new Face(this.vertices, 1, 2, 0),
        new Face(this.vertices, 2, 7, 6),
        new Face(this.vertices, 7, 4, 6),
        new Face(this.vertices, 4, 1, 0),
        new Face(this.vertices, 2, 4, 0),
        new Face(this.vertices, 3, 5, 7),
        new Face(this.vertices, 9, 11, 10),
        new Face(this.vertices, 23, 10, 22),
        new Face(this.vertices, 10, 14, 15),
        new Face(this.vertices, 18, 10, 15),
        new Face(this.vertices, 9, 13, 8),
        new Face(this.vertices, 19, 9, 23),
        new Face(this.vertices, 15, 19, 18),
        new Face(this.vertices, 19, 22, 18),
        new Face(this.vertices, 11, 21, 20),
        new Face(this.vertices, 21, 16, 20),
        new Face(this.vertices, 11, 16, 14),
        new Face(this.vertices, 8, 17, 21),
        new Face(this.vertices, 17, 14, 16),
        new Face(this.vertices, 14, 12, 15),
        new Face(this.vertices, 1, 3, 2),
        new Face(this.vertices, 2, 3, 7),
        new Face(this.vertices, 7, 5, 4),
        new Face(this.vertices, 4, 5, 1),
        new Face(this.vertices, 2, 6, 4),
        new Face(this.vertices, 3, 1, 5),
        new Face(this.vertices, 9, 8, 11),
        new Face(this.vertices, 23, 9, 10),
        new Face(this.vertices, 10, 11, 14),
        new Face(this.vertices, 18, 22, 10),
        new Face(this.vertices, 9, 12, 13),
        new Face(this.vertices, 19, 12, 9),
        new Face(this.vertices, 15, 12, 19),
        new Face(this.vertices, 19, 23, 22),
        new Face(this.vertices, 11, 8, 21),
        new Face(this.vertices, 21, 17, 16),
        new Face(this.vertices, 11, 20, 16),
        new Face(this.vertices, 8, 13, 17),
        new Face(this.vertices, 17, 13, 14),
        new Face(this.vertices, 14, 13, 12)

      ];
    }
  }
}